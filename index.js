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
    
    const tabular_data = document.querySelector("#tabular_data");
    const new_row = document.createElement("tr");
    
    new_row.innerHTML = `
        <td>${dataset[dataset.length-1][0]}</td>
        <td>${dataset[dataset.length-1][1]}</td>
    `;

    tabular_data.appendChild(new_row);
}

function calculatePearsonRegression() {
    calculateDatasetMean();
    calculateDatasetStdDev();
    calculateDatasetCovariance();
    
    dataset_pearson_correlation = dataset_covariance/(dataset_x_std_dev * dataset_y_std_dev);
    
    populateValues();
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
}