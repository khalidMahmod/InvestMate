var allocationChartInstance;
var investmentChart;

document.addEventListener('DOMContentLoaded', () => {
    // Event listener for the Send button
    document.getElementById('sendMessageButton').addEventListener('click', () => {
        const message = document.getElementById('userInput').value;
        hideInitialPrompts();
        callInvestMateApi(message, false);
        document.getElementById('userInput').value = '';
    });

    // Event listeners for each prompt link
    document.querySelectorAll('.prompt-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const message = event.target.textContent;
            hideInitialPrompts();
            callInvestMateApi(message, false);
        });
    });
});

function flipCard() {
    var flipCardInner = document.querySelector('.flip-card-inner');
    flipCardInner.style.transform = 'rotateY(180deg)';
}

// Function to unflip the card
function unflipCard() {
    var flipCardInner = document.querySelector('.flip-card-inner');
    flipCardInner.style.transform = '';
}

document.addEventListener('DOMContentLoaded', function () {
    var closeButton = document.querySelector('.close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', unflipCard);
    } else {
        console.error('Close button not found');
    }
});

function handleSubmit(event) {
    event.preventDefault();

    const url = 'https://apitest.iqiglobal.com/api/v1/chats/calculate';

    var isShariahCompliantChecked = document.getElementById('shariah_compliant').checked;

    const params = {
        investment_experience: event.target.investment_experience.value,
        financial_goal: event.target.financial_goal.value,
        duration: event.target.duration.value,
        risk_level: event.target.risk_level.value,
        monthly_savings: event.target.monthly_savings.value,
        monthly_income: event.target.monthly_income.value,
        is_shariah_compliant: isShariahCompliantChecked
    };
    
    const filteredData = Object.keys(params).reduce((acc, key) => {
        if (params[key] !== '') {
            acc[key] = params[key];
        }
        return acc;
    }, {});

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'n3@m0kh@0n@7f2!s0A16asdljasdaslsa8asdksd93234'
        },
        body: JSON.stringify(filteredData)
    })
    .then(response => response.json())
    .then(data => {
        flipCard();
        var allocationLabels = Object.keys(data.allocations);
        var allocationPercentages = Object.values(data.allocations).map(function(value) {
            return parseFloat(value);
        });
        drawAllocationCanvas(allocationLabels, allocationPercentages);

        var labels = Object.keys(data.yearly_rot);
        var worstData = labels.map(function(year) { return data.yearly_rot[year].worst; });
        var avgData = labels.map(function(year) { return data.yearly_rot[year].avg; });
        var bestData = labels.map(function(year) { return data.yearly_rot[year].best; });

        createYearlyRotTable(data.yearly_rot);
        drawYearlyReturnOnInvestment(labels, worstData, avgData, bestData);

        var durationElement = document.querySelector('.text_duration');
        if (durationElement) {
            durationElement.textContent = filteredData.duration;
        }

        var targetAmount = document.querySelector('.text_target_amount');
        if (targetAmount) {
            targetAmount.textContent = filteredData.financial_goal;
        }

        var textMonthlyInvestment = document.querySelector('.text_monthly_investment');
        if (textMonthlyInvestment) {
            textMonthlyInvestment.textContent = data.monthly_investment;
        }
        callInvestMate(data, params);
    })
    .catch(error => {
        console.error(error);
        loader.classList.remove('show'); // hide the loader
    });
}

function appendMessage(role, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add(role);

    const iconSpan = document.createElement('span');
    iconSpan.style.paddingRight = '5px';

    // Choose the icon based on the role
    if (role === "user") {
        iconSpan.innerHTML = '<i class="bi bi-person-fill me-2"></i>';
        const paragraph = document.createElement('span');
        paragraph.innerHTML = message;
        messageElement.appendChild(iconSpan);
        messageElement.appendChild(paragraph);
    } else {
        iconSpan.innerHTML = '<i class="bi bi-robot me-2"></i> ';
        messageElement.appendChild(iconSpan);
        createAssistantMessage(messageElement, message);
    }

    chatMessages.appendChild(messageElement);
    if (role == 'user') {
        scrollToLatestUserMessage(chatMessages);
    } else {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function scrollToLatestUserMessage(chatMessages) {
    // Get the last user message element
    const userMessages = chatMessages.getElementsByClassName('user');
    const lastUserMessage = userMessages[userMessages.length - 1];

    if (lastUserMessage) {
        // Calculate the top position of the last user message relative to the chatMessages div
        const topPos = lastUserMessage.offsetTop;

        // Scroll to the top position of the last user message
        chatMessages.scrollTop = topPos;
    }
}

function callInvestMate(params, requestParams) {
    hideInitialPrompts();
    var message = "Give me investment suggestions from Hong Leong Bank with following details: \n " +
        "Investment Experience: " + requestParams.investment_experience + ", " +
        "Financial Goal: " + requestParams.financial_goal + " RM, " +
        "Duration: " + requestParams.duration + " years, " +
        "Monthly Investment: " + params.monthly_investment + " RM, " + 
        "Risk Toleration: " + requestParams.risk_level + ", " +
        "Looking for shariah compliant investment schemes: " + requestParams.is_shariah_compliant + ".";

    if (requestParams.monthly_savings && requestParams.monthly_savings > 0) {
        message += "Provide insights based on my monthly income and savings. My Monthly Income is: " + requestParams.monthly_income + " RM and " +
                    "My monthly savings is: " + requestParams.monthly_savings + " RM";
    }
    
    callInvestMateApi(message, true);
}

function hideInitialPrompts(){
    var initialHelpText = document.getElementById('initial-help-text');
    initialHelpText.classList.add('d-none');

    var initialPrompts = document.querySelector('.initial-prompts');
    initialPrompts.classList.add('d-none');
}

function createAssistantMessage(container, message) {
    message = message.replace(/Main Suggestion:.*?\n/, ' ');
    const [mainContent, detailedContent] = message.split('Detailed Explanation:');

    const mainContentSpan = document.createElement('span');
    console.log("Main Content");
    console.log(mainContent);
    const updatedResponse = mainContent.replace(/1\. ?<strong>Main Suggestion:<\/strong><br>|1\. Main Suggestion:<br><br>|### Main Suggestions:<br>|<strong>Main Suggestion:<\/strong><br>/g, '');
    mainContentSpan.innerHTML = updatedResponse;
    container.appendChild(mainContentSpan);

    if (detailedContent) {
        const parts = detailedContent.split('Follow-up Questions:');
        const matches = parts[1] ? parts[1].match(/\d\..+?<br>/g) : null;
        const questions = matches ? matches.map(q => q.slice(3, -4)) : [];

        populateFollowUpQuestions(questions);

        const detailedContentSpan = document.createElement('span');
        const readMoreButton = document.createElement('button');
        readMoreButton.textContent = 'Read More';
        readMoreButton.classList.add('btn', 'btn-primary'); // Bootstrap button classes
        
        const investNowButton = document.createElement('button');
        investNowButton.textContent = 'Invest Now';
        investNowButton.classList.add('btn', 'btn-success', 'm-2');

        // Optionally, if the button should act as a link, you can add an event listener
        investNowButton.addEventListener('click', function() {
            investNowButton.addEventListener('click', function() {
                window.open('https://www.hlb.com.my/rib/app/fo/login?t=1&s=230608005240?icp=hlb-en-pdp-cta-txt-investment-unit-trust-1', '_blank');
            });
        });

        readMoreButton.onclick = function() {
            detailedContentSpan.style.display = 'block';
            readMoreButton.style.display = 'none';
        };
        container.appendChild(readMoreButton);
        container.appendChild(investNowButton);

        detailedContentSpan.innerHTML = parts[0];
        detailedContentSpan.style.display = 'none';
        container.appendChild(detailedContentSpan);
    }
}

function populateFollowUpQuestions(questions) {
    const initialPromptsDiv = document.querySelector('.initial-prompts');
    const links = initialPromptsDiv.querySelectorAll('a');
    questions.forEach((question, index) => {
        if (links[index]) {
            links[index].innerHTML = question;
        }
    });

    // Make the div visible if it's not
    initialPromptsDiv.classList.remove('d-none');
}

// Function to create a link for each question
function createLink(question, index) {
    const link = document.createElement('a');
    link.href = `#question-${index}`; // Modify this href to point to the appropriate destination
    link.textContent = question;
    link.classList.add('question-link');
    return link;
}

function callInvestMateApi(message, withData) {
    const loader = document.getElementById('loader');
    const loaderContainer = document.querySelector('.output');

    loader.style.display = 'block';
    loaderContainer.classList.add('loading');

    appendMessage('user', message);

    const url = 'https://apitest.iqiglobal.com/api/v1/chats/investment';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'n3@m0kh@0n@7f2!s0A16asdljasdaslsa8asdksd93234'
        },
        body: JSON.stringify({ prompt: message, with_data: withData })
    })
    .then(response => response.json())
    .then(data => {
        loader.style.display = 'none'; // hide loader
        loaderContainer.classList.remove('loading');
        console.log(data);
        let formattedMessage = data.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedMessage = formattedMessage.replace(/\n/g, '<br>');

        appendMessage('assistant', formattedMessage);
    })
    .catch(error => {
        console.error(error);
        loader.classList.remove('show'); // hide the loader
    });
}

function drawAllocationCanvas(labels, data) {
    var ctx = document.getElementById('allocationChart').getContext('2d');

    if (allocationChartInstance) {
        allocationChartInstance.destroy();
    }

    allocationChartInstance = new Chart(ctx, {
        type: 'doughnut', 
        data: {
            labels: labels,
            datasets: [{
                label: 'Percentage Allocation',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',  // color for Mixed Asset
                    'rgba(54, 162, 235, 0.2)',  // color for Money Market Funds
                    'rgba(75, 192, 192, 0.2)'   // color for Equity
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Investment Allocation Percentages'
            }
        }
    });
}

function createYearlyRotTable(yearlyRotData) {
    const tableId = 'yearlyReturnOnInvestmentTable'; // Replace with your desired table ID
    let table = document.getElementById(tableId);

    if (table) {
        table.remove();
    }
    
    table = document.createElement('table');
    table.id = tableId;
    table.className = 'table table-striped table-bordered table-hover';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    // Add header row
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);
    ['Year', 'Worst', 'Average', 'Best'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    // Add data rows
    Object.keys(yearlyRotData).forEach(year => {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);

        const tdYear = document.createElement('td');
        tdYear.textContent = year;
        tr.appendChild(tdYear);

        ['worst', 'avg', 'best'].forEach(key => {
            const td = document.createElement('td');
            td.textContent = yearlyRotData[year][key].toFixed(2);
            tr.appendChild(td);
        });
    });

    // Append the table to your document
    // Replace 'yourTableContainer' with the actual ID or class of your container element
    document.querySelector('#yearlyRotTable').appendChild(table);
}

function drawYearlyReturnOnInvestment(labels, worstData, avgData, bestData) {
    // Create the chart
    var ctx = document.getElementById('investmentChart').getContext('2d');
    if (investmentChart) {
        investmentChart.destroy();
    }
    investmentChart = new Chart(ctx, {
        type: 'line', // You can also choose 'bar' or other chart types
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Worst Case',
                    data: worstData,
                    borderColor: 'red',
                    fill: false
                },
                {
                    label: 'Average Case',
                    data: avgData,
                    borderColor: 'blue',
                    fill: false
                },
                {
                    label: 'Best Case',
                    data: bestData,
                    borderColor: 'green',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Projected Investment Returns'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                x: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Year'
                    }
                },
                y: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value (RM)'
                    }
                }
            }
        }
    });
}