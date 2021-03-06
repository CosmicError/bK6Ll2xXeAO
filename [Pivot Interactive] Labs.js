// ==UserScript==
// @name         [Pivot Interactive] Labs
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  try to take over the world!
// @author       Jack
// @match        https://app.pivotinteractives.com/assignments/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/CosmicError/bK6Ll2xXeAO/main/%5BPivot%20Interactive%5D%20Labs.js
// @grant        none
// ==/UserScript==

'use strict';
(function() {
    let allowedQuestionTypes = ["MultipleChoiceQuestion", "NumericalQuestion", "GridGraphQuestion"]
    let multipleChoice = ["A", "B", "C", "D", "E", "F", "G"]
    let trial = null

    async function getData() {
        let webResponseResponse = await fetch("https://api.pivotinteractives.com/api/v3/assignments/" + document.URL.split("/")[4] + "/response?_xff=editor", {
            "headers": {
                "accept": "application/json, text/plain, * /* ",
                "accept-language": "en-US,en;q=0.9",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Opera\";v=\"84\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "referrer": "https://app.pivotinteractives.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });
        // wait for the fetch to finish, then convert to json
        let responseData = await webResponseResponse.json();
        let webResponseActivity = await fetch("https://api.pivotinteractives.com/api/v3/assignments/" + document.URL.split("/")[4] + "/activity?_xff=editor", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Opera\";v=\"84\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "referrer": "https://app.pivotinteractives.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });
        // wait for the fetch to finish, then convert to json
        let activityData = await webResponseActivity.json();
        let sections = activityData.sections;
        // run though all the different lab sections
        for (let i = 0; i < sections.length; i++) {
            // make sure there are allowed questions in the target section (so no empty sections)
            for (let x = 0; x < sections[i].components.length; x++) {
                if (allowedQuestionTypes.includes(sections[i].components[x].componentType)) {
                    //create new answer group for section
                    if (i == 0) {
                        console.group(sections[i].name)
                    } else {
                        console.groupCollapsed(sections[i].name)
                    }
                    break
                };
            };
            // run through all the components of the lab section
            for (let x = 0; x < sections[i].components.length; x++) {
                //check for question type and handle approprietly
                if (sections[i].components[x].componentType == allowedQuestionTypes[0]) { // Multiple Choice
                    // run through all answer choices
                    for (let y = 0; y < sections[i].components[x].choices.length; y++) {
                        // if the correct answer, then, log it to console
                        if (sections[i].components[x].choices[y].answer == true) {
                            console.log("Question "+x+"; Answer: "+multipleChoice[y]);
                        };
                    };
                } else if (sections[i].components[x].componentType == allowedQuestionTypes[1]) { // Numeric
                    // run through all the different answers for the assignment
                    for (let y = 0; y < sections[i].components[x].conditions.length; y++) {
                        // if the answer is correct
                        if (sections[i].components[x].conditions[y].isCorrect == true) {
                            // splice the correct answer approprietly
                            let answer = sections[i].components[x].conditions[y].condition;
                            if (sections[i].components[x].conditions[y].condition.includes("==")) {
                                answer = sections[i].components[x].conditions[y].condition.split("==")[1];
                                if (!trial) {
                                    for (let a = 0; a < responseData.variables.length; a++) {
                                        if (sections[i].components[x].conditions[y].condition.split("==")[0].includes(responseData.variables[a].id)) {
                                            trial = responseData.variables[a].value
                                        };
                                    };

                                };
                            };
                            // make sure varibles exist otherwise if they dont then it will error
                            if (activityData.variables.length > 0) {
                                // replace all variables with their actual meaning
                                for (let a = 0; a < activityData.variables.length; a++) {
                                    if (answer.includes(activityData.variables[a].id)) {
                                        // Remove irrelevant characters
                                        answer = answer.replace("$", "");
                                        if (/^\d*\^?\d*\.?\d+$/.test(responseData.variables[a].value)) {
                                            answer = answer.replace(activityData.variables[a].id, responseData.variables[a].value);
                                        } else {
                                            answer = answer.replace(activityData.variables[a].id, activityData.variables[a].name);
                                        };
                                    };
                                };
                            };
                            // if the answer is specific to a certain trial, then make sure it is the trial assigned to the user
                            if (answer.includes("?")) {
                                if (answer.split("?")[0] == trial) {
                                    answer = answer.split("?")[1].split(":")[0]
                                    if (/[^a-z]*[^A-Z]*[-+*\/()]*[0-9]+/.test(answer)) {
                                        //cyber security risk but im too lazy to find another way (int overflow attack)
                                        // + is to get rid of trailing 0's
                                        answer = +parseFloat(eval(answer.replace("^", "**"))).toFixed(3)
                                    };
                                    console.log("Question "+x+"; Answer: "+answer);
                                };
                            // if the answer is not specific to a certain trial, then just print the answer as long as its correct
                            } else {
                                if (/[^a-z]*[^A-Z]*[-+*\/()]*[0-9]+/.test(answer)) {
                                    //cyber security risk but im too lazy to find another way (int overflow attack)
                                    // + is to get rid of trailing 0's
                                    answer = +parseFloat(eval(answer.replace("^", "**"))).toFixed(3)
                                };
                                console.log("Question "+x+"; Answer: "+answer);
                            };
                        };
                    };
                } else if (sections[i].components[x].componentType == allowedQuestionTypes[2]) { // Graph/Table
                    // make sure the table has an answer
                    if (sections[i].components[x].answer) {
                        let answer = JSON.parse(sections[i].components[x].answer);
                        // run through all the correct table answers and make sure they have stuff in em
                        for (let y = 0; y < answer.columns.length; y++) {
                            let Data = answer.columns[y].data
                            if (Data.toString().trim() != ','.repeat(answer.columns[y].data.length-1)) {
                                // create new question group so all tables are grouped under the same question
                                console.groupCollapsed("Question "+x+"; Table:")
                                // run through all the correct table answers
                                for (let z = 0; z < answer.columns.length; z++) {
                                    let Data = answer.columns[z].data
                                    // make sure the tables aren't empty, if they are then remove them if possible
                                    if (Data.toString().trim() != ','.repeat(answer.columns[z].data.length-1)) { // && answer.columns[z].name.includes()
                                        // Group the table
                                        let group = "Column "+z+" Data ["+answer.columns[z].name+" ("+answer.columns[z].units+", "+answer.columns[z].variable+")]"
                                        console.groupCollapsed(group);
                                        console.table(Data)
                                        console.groupEnd(group);
                                    };
                                };
                                // Close question group
                                console.groupEnd("Question "+x)
                                break
                            };
                        };
                    };
                };
            };
            // CLose section group
            console.groupEnd(sections[i].name)
        };
    };
    getData();
})();
