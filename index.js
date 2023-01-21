const dataset = [];
let dataset_x_mean = 0;
let dataset_y_mean = 0;
let dataset_x_std_dev = 0;
let dataset_y_std_dev = 0;
let dataset_covariance = 0;
let dataset_pearson_correlation = 0;

const X_field = document.querySelector("#x_field");
const Y_field = document.querySelector("#y_field");

const add_btn = document.querySelector("#add_btn");
const calculate_btn = document.querySelector("#calculate_btn");

add_btn.addEventListener('click', addToDataset);
calculate_btn.addEventListener('click', calculatePearsonRegression);


function populateValues() {
    const x_mean = document.querySelector("#X_mean");
    const y_mean = document.querySelector("#Y_mean");

    const x_std_dev = document.querySelector("#X_std_dev");
    const y_std_dev = document.querySelector("#Y_std_dev");

    const pearson_correlation_container = document.querySelector("#pearson_correlation");

    const correlation_interpretation = document.querySelector("#correlation_interpretation");
    x_mean.innerHTML = dataset_x_mean;
    y_mean.innerHTML = dataset_y_mean;

    x_std_dev.innerHTML = dataset_x_std_dev;
    y_std_dev.innerHTML = dataset_y_std_dev;
    pearson_correlation_container.innerHTML = dataset_pearson_correlation;
    correlation_interpretation.innerHTML = dataset_pearson_correlation === 0 ? 'No correlation' : 
        (dataset_pearson_correlation > 0 && dataset_pearson_correlation < 0.50) || 
        (dataset_pearson_correlation < 0 && dataset_pearson_correlation > -0.50) ? 'Neutral' : 'Some correlation';
}

function validateInput(input) {
    if (typeof input != 'string') return false; // only process strings!
    return !isNaN(input)             // type coercion to parse entire string
        && !isNaN(parseFloat(input)) // ensure strings of whitespaces fail
        && parseFloat(input);        // validation passes, return parsed value
}

function setValidationMsg(field) {
    document.querySelectorAll(".validation-msg").forEach(item => item.innerHTML = "");
    const validation_msg_container = document.querySelector(`#${field}_validation`);
    validation_msg_container.innerHTML = `Invalid ${field} value`;
}

function toggleCalculateButton() {
    calculate_btn.disabled = !calculate_btn.disabled;
}

function addToDataset() {
    let curr_x_val = validateInput(X_field.value);
    let curr_y_val = validateInput(Y_field.value);
    if (!curr_x_val || !curr_y_val) {
        setValidationMsg(!curr_x_val ? 'x' : 'y');
        if (!calculate_btn.disabled) toggleCalculateButton();
        return;
    }
    if (calculate_btn.disabled) toggleCalculateButton();
    
    document.querySelectorAll(".validation-msg").forEach(item => item.innerHTML = "");

    dataset.push([curr_x_val, curr_y_val]);
    
    const tabular_data_body = document.querySelector("#tabular_data").getElementsByTagName("tbody")[0];
    const new_row = document.createElement("tr");
    
    new_row.innerHTML = `
        <td class="border border-lime-400 pl-2">${dataset[dataset.length-1][0]}</td>
        <td class="border border-lime-400 pl-2">${dataset[dataset.length-1][1]}</td>
    `;

    tabular_data_body.appendChild(new_row);
    X_field.value = '';
    Y_field.value = '';
    flickerElement('tab_data_container');
}

function calculatePearsonRegression() {
    calculateDatasetMean();
    calculateDatasetStdDev();
    calculateDatasetCovariance();
    
    dataset_pearson_correlation = dataset_covariance/(dataset_x_std_dev * dataset_y_std_dev) || 0;
    
    populateValues();
    plotData();
    flickerElement('plot');
    flickerElement('correlation_interpretation', 1000, Infinity);
}

function calculateDatasetMean() {
    let x_sum = 0;
    let y_sum = 0;
    for (let i = 0; i < dataset.length; i++) {
        x_sum += dataset[i][0];
        y_sum += dataset[i][1];
    }
    dataset_x_mean = x_sum/dataset.length;
    dataset_y_mean = y_sum/dataset.length;
}

function calculateDatasetStdDev() {
    let sqr_x_sum = 0;
    let sqr_y_sum = 0;
    for (let i = 0; i < dataset.length; i++) {
        sqr_x_sum += (dataset[i][0] - dataset_x_mean) ** 2;
        sqr_y_sum += (dataset[i][1] - dataset_y_mean) ** 2;
    }
    dataset_x_std_dev = Math.sqrt(sqr_x_sum/dataset.length);
    dataset_y_std_dev = Math.sqrt(sqr_y_sum/dataset.length);
}

function calculateDatasetCovariance() {
    let cov_sum = 0
    for (let i = 0; i < dataset.length; i++) {
        cov_sum += (dataset[i][0] - dataset_x_mean) * (dataset[i][1] - dataset_y_mean);
    }
    dataset_covariance = cov_sum/dataset.length;
    console.log(dataset_covariance);
}

function flickerElement(element, duration=300, iterations=2) {
    console.log("animating: " + element);
    document.getElementById(element).animate([
        // keyframes
        { color: '#334155', backgroundColor: '#84cc16' },
        { color: '#84cc16', backgroundColor: 'transparent' },
    ], {
        duration: duration,
        iterations: iterations
    });
}

function plotData() {
    const parentContainer = document.querySelector("#plot_container");
    const svg = d3.select("#data_plot");
    const width = parentContainer.clientWidth;
    const height = parentContainer.clientHeight

    const maxX = Math.max(...dataset.map(x => x[0]));
    const maxY = Math.max(...dataset.map(x => x[1]));

    /**
     * For some reason, while building the scales for x & Y axis, using height and width as range is not enough
     * to fill the svg container.
     * A certain value must be added (or taken) to both height and width.
     * After visualy evaluating an amount to add that looks good for small and big screens, 
     * it was determined this value follows a linear inverse proportion 
     * (the smaller the screen, the more needs to be added, and viceversa).
     * Use the d3 scaleLinear method to automatically obtain the appropiate scaling function.
     * Then plug the value as an added value to the width and height in the scaling function to build the axis.
     */
    const widthScale = d3.scaleLinear().domain([240, 990]).range([600, -150]);
    const heightScale = d3.scaleLinear().domain([130, 550]).range([280, -150]);

    const xScale = d3.scaleLinear().domain([0, maxX]).range([0, width + widthScale(width)]);
    const yScale = d3.scaleLinear().domain([0, maxY]).range([height + heightScale(height), 0]);

    const g = svg.append('g')
                .attr('transform', `translate(${maxX}, ${maxY})`); // alternative to fill container: add scale(2.5) to transform attr

    const gridColor = '#65a30d';
    const dataColor = '#84cc16';
    const gridColorOpacity = 0.3;
    const fontFamily = 'VT323';
    const labelFontSize = 20;
    const tickFontSize = 16;
    // X label
    svg.append('text')
        .attr('x', width + widthScale(width) + maxX + 20)
        .attr('y', height + heightScale(height) + maxY + 15)
        .attr('text-anchor', 'middle')
        .style('font-family', fontFamily)
        .style('font-size', labelFontSize)
        .style('fill', dataColor)
        .text('X');
    // Y label
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(25, 40)`)
        .style('font-family', fontFamily)
        .style('font-size', labelFontSize)
        .style('fill', dataColor)
        .text('Y');
    
    // Bottom Axis
    const xAxis = g.append('g')
                    .attr('transform', `translate(0, ${height + heightScale(height)})`)
                    .call(d3.axisBottom(xScale).tickSize(-height-heightScale(height)));
    xAxis.select('.domain').remove();
        // .attr('stroke', gridColor)
        // .attr('stroke-opacity', gridColorOpacity);
    xAxis.selectAll('.tick line')
        .attr('stroke', gridColor)
        .attr('stroke-opacity', gridColorOpacity);
    xAxis.select('.tick line').remove();

    xAxis.selectAll('.tick text')
        .attr('font-family', fontFamily)
        .attr('font-size', tickFontSize)
        .attr('fill', gridColor)
    xAxis.select('.tick text').remove();
    
    // Left Axis
    const yAxis = g.append('g')
                    .call(d3.axisLeft(yScale).tickSize(-width-widthScale(width)));
    
    yAxis.select('.domain').remove();
        // .attr('stroke', gridColor)
        // .attr('stroke-opacity', gridColorOpacity);
    yAxis.selectAll('.tick line')
        .attr('stroke', gridColor)
        .attr('stroke-opacity', gridColorOpacity);
    yAxis.select('.tick line').remove();

    yAxis.selectAll('.tick text')
        .attr('font-family', fontFamily)
        .attr('font-size', tickFontSize)
        .attr('fill', gridColor)

    // DOTS
    svg.append('g')
        .selectAll('dot')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d[0]))
        .attr('cy', (d) => yScale(d[1]))
        .attr('r', 4)
        .attr('transform', `translate(${maxX}, ${maxY})`)
        .style('fill', dataColor);
}