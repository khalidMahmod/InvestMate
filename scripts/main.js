var allocationChartInstance;
            const chatMessages = document.getElementById('chat-messages');
            var investmentChart;
            function flipCard() {
                var flipCardInner = document.querySelector('.flip-card-inner');
                flipCardInner.style.transform = 'rotateY(180deg)';
            }

            // Function to unflip the card
            function unflipCard() {
                var flipCardInner = document.querySelector('.flip-card-inner');
                flipCardInner.style.transform = '';
            }

            // Event listener for the close button
            document.querySelector('.close-btn').addEventListener('click', unflipCard);

            function handleSubmit(event) {
                event.preventDefault();

                const url = 'https://apitest.iqiglobal.com/api/v1/chats/calculate';

                const data = {
                    financial_goal: event.target.financial_goal.value,
                    duration: event.target.duration.value,
                    risk_level: event.target.risk_level.value,
                    monthly_savings: event.target.monthly_savings.value
                };
                const filteredData = Object.keys(data).reduce((acc, key) => {
                    if (data[key] !== '') {
                        acc[key] = data[key];
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

                        drawYearlyReturnOnInvestment(labels, worstData, avgData, bestData);

                        var durationElement = document.querySelector('.text_duration');
                        if (durationElement) {
                            durationElement.textContent = data.duration;
                        }

                        var targetAmount = document.querySelector('.text_target_amount');
                        if (targetAmount) {
                            targetAmount.textContent = data.target_amount;
                        }

                        var textMonthlyInvestment = document.querySelector('.text_monthly_investment');
                        if (textMonthlyInvestment) {
                            textMonthlyInvestment.textContent = data.monthly_investment;
                        }
                        callInvestMe(data);
                    })
                    .catch(error => {
                        console.error(error);
                        loader.classList.remove('show'); // hide the loader
                    });
            }

            function appendMessage(role, message) {
                const messageElement = document.createElement('div');
                messageElement.classList.add(role);

                const iconSpan = document.createElement('span');

                // Choose the icon based on the role
                if (role === "user") {
                    iconSpan.innerHTML = '<i class="bi bi-person-fill me-2"></i>';
                } else {
                    iconSpan.innerHTML = '<i class="bi bi-robot me-2"></i> ';
                }

                const paragraph = document.createElement('span');
                paragraph.innerHTML = message; // Remember, sanitize if 'message' contains user-generated content

                // Append the icon and message to the messageElement container
                messageElement.appendChild(iconSpan);
                messageElement.appendChild(paragraph);

                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }


            function getLastBotMessage() {
                var botMessages = document.querySelectorAll('#output .botMessage');
                if (botMessages.length === 0) {
                    return null; // No bot messages found
                }
                return botMessages[botMessages.length - 1]; // Return the last bot message
            }

            function callInvestMe(params) {
                var initialPrompts = document.querySelector('.initial-prompts');
                initialPrompts.classList.add('d-none');


                const loader = document.getElementById('loader');
                const loaderContainer = document.querySelector('.output');

                loader.style.display = 'block';
                loaderContainer.classList.add('loading');

                var message = "Give me investment suggestions from Hong Leong Bank with following details: \n " +
                    "Financial Goal: " + params.target_amount + " RM, " +
                    "Duration: " + params.duration + " years, " +
                    "Monthly Investment: " + params.monthly_investment + " RM \n";

                appendMessage('user', message);

                var initialHelpText = document.getElementById('initial-help-text');
                initialHelpText.classList.add('d-none');

                const url = 'https://apitest.iqiglobal.com/api/v1/chats/investment';

                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'n3@m0kh@0n@7f2!s0A16asdljasdaslsa8asdksd93234'
                    },
                    body: JSON.stringify(params)
                })
                    .then(response => response.json())
                    .then(data => {
                        loader.style.display = 'none'; // hide loader
                        loaderContainer.classList.remove('loading');
                        let formattedMessage = data.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        formattedMessage = formattedMessage.replace(/\n/g, '<br>');
                        console.log(formattedMessage);

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
                    type: 'pie', // or 'doughnut' for a doughnut chart
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