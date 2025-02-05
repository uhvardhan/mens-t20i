document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for all tables
    const table1Inputs = ['netPlayingTime', 'firstInningsProgressTime', 'lostPlayingTime', 
                         'extraTime', 'madeUpTime', 'recommenceTime'];
    
    const table2Inputs = ['restartTime', 'cutOffTime', 'oversFaced'];
    
    const table3Inputs = ['table2Overs', 'startTime'];

    const table4Inputs = ['startInningsTime','startInterruptionTime','restartTime','additionalTime','maxOvers'];
    
    [...table1Inputs, ...table2Inputs, ...table3Inputs, ...table4Inputs].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateAllCalculations);
            element.addEventListener('input', updateAllCalculations);
        }
    });

    updateAllCalculations();
});

function calculatePowerplayOvers(oversPerInnings) {
    if (oversPerInnings < 5) {
        return "Minimum 5 overs.";
    }
    
    const distribution = Array(2).fill(0);
    
    if (oversPerInnings >= 5 && oversPerInnings <= 8) {
        distribution[0] = 2;
        distribution[1] = oversPerInnings-2;
    } else if (oversPerInnings >= 9 && oversPerInnings <= 11) {
        distribution[0] = 3;
        distribution[1] = oversPerInnings-3;
    } else if (oversPerInnings >= 12 && oversPerInnings <= 14) {
        distribution[0] = 4;
        distribution[1] = oversPerInnings-4;
    } else if (oversPerInnings >= 15 && oversPerInnings <= 18) {
        distribution[0] = 5;
        distribution[1] = oversPerInnings-5;
    } else if (oversPerInnings >= 19 && oversPerInnings <= 20) {
        distribution[0] = 6;
        distribution[1] = oversPerInnings-6;
    }
    return distribution;
}

function calculateOversDistribution(oversPerInnings) {
    if (oversPerInnings < 5) {
        return "Minimum 5 overs.";
    }
    
    if (oversPerInnings >= 10) {
        const baseOvers = Math.floor(oversPerInnings / 5);
        const extraOvers = oversPerInnings % 5;
        return Array(5).fill(0).map((_, index) => 
            index < extraOvers ? baseOvers + 1 : baseOvers
        );
    } else if (oversPerInnings >= 5 && oversPerInnings <= 9) {
        const maxOversPerBowler = 2;
        const numBowlers = Math.ceil(oversPerInnings / maxOversPerBowler);
        const distribution = Array(numBowlers).fill(1);
        const remainingOvers = oversPerInnings - numBowlers;
        for (let i = 0; i < remainingOvers; i++) {
            distribution[i] += 1;
        }
        return distribution;
    }
}

function addMinutesToTime(timeStr, minutes) {
    if (!timeStr) return '';
    
    const [hours, mins] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
    
    return date.getHours().toString().padStart(2, '0') + ':' + 
           date.getMinutes().toString().padStart(2, '0');
}

function getMinutesBetweenTimes(time1, time2) {
    if (!time1 || !time2) return 0;
    
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    const date1 = new Date();
    const date2 = new Date();
    
    date1.setHours(hours1, minutes1, 0);
    date2.setHours(hours2, minutes2, 0);
    
    if (date2 < date1) {
        date2.setDate(date2.getDate() + 1);
    }
    
    return Math.round((date2 - date1) / (1000 * 60));
}

function updateAllCalculations() {
    updateTable1Calculations();
    updateTable2Calculations();
    updateTable3Calculations();
    updateTable4Calculations();
}

function updateTable1Calculations() {
    const lostPlayingTime = Number(document.getElementById('lostPlayingTime').value) || 0;
    const extraTime = Number(document.getElementById('extraTime').value) || 0;
    const madeUpTime = Number(document.getElementById('madeUpTime').value) || 0;
    const progressTime = Number(document.getElementById('firstInningsProgressTime').value) || 0;
    
    const effectivePlayingTimeLost = lostPlayingTime - (extraTime + madeUpTime);
    document.getElementById('effectiveTimeResult').textContent = effectivePlayingTimeLost;

    const netPlayingTime = Number(document.getElementById('netPlayingTime').value) || 0;
    const remainingPlayingTime = netPlayingTime - effectivePlayingTimeLost;
    document.getElementById('remainingTimeResult').textContent = remainingPlayingTime;

    const remainingOvers = remainingPlayingTime / 4.25;
    document.getElementById('remainingOversResult').textContent = remainingOvers.toFixed(2);

    const maxOversPerTeam = Math.ceil(remainingOvers/2);
    document.getElementById('maxOverperteamResult').textContent = maxOversPerTeam;

    const oversDistribution = calculateOversDistribution(maxOversPerTeam);
    if (typeof oversDistribution === 'string') {
        document.getElementById('maxOverperBowlerResult').textContent = oversDistribution;
    } else {
        document.getElementById('maxOverperBowlerResult').textContent = oversDistribution.join(',');
    }

    const powerplayOversDistribution = calculatePowerplayOvers(maxOversPerTeam);
    if (typeof powerplayOversDistribution === 'string') {
        document.getElementById('powerplayOversResult').textContent = powerplayOversDistribution;
    } else {
        document.getElementById('powerplayOversResult').textContent = powerplayOversDistribution.join(',');
    }

    const inningsLength = Math.ceil(maxOversPerTeam * 4.25);
    document.getElementById('lengthInningsTime').textContent = inningsLength;

    updateTimeCalculations();
}

function updateTimeCalculations() {
    const recommenceTime = document.getElementById('recommenceTime').value;
    const inningsLength = Number(document.getElementById('lengthInningsTime').textContent) || 0;
    const progressTime = Number(document.getElementById('firstInningsProgressTime').value) || 0;
    
    const remainingFirstInnings = inningsLength - progressTime;
    const cessationTime = addMinutesToTime(recommenceTime, remainingFirstInnings);
    document.getElementById('rescheduledCessationTime').textContent = cessationTime || '';
    
    const intervalLength = 10;
    document.getElementById('intervalLength').textContent = intervalLength;
    
    const secondInningsStart = addMinutesToTime(cessationTime, intervalLength);
    document.getElementById('commencementTime').textContent = secondInningsStart || '';
    
    const finalCessationTime = addMinutesToTime(secondInningsStart, inningsLength);
    document.getElementById('finalCessationTime').textContent = finalCessationTime || '';
}

function updateTable2Calculations() {
    const restartTime = document.getElementById('restartTime').value;
    const cutOffTime = document.getElementById('cutOffTime').value;
    const oversFaced = Number(document.getElementById('oversFaced').value) || 0;
    
    const minutesBetween = getMinutesBetweenTimes(restartTime, cutOffTime);
    document.getElementById('minutesBetween').textContent = minutesBetween;
    
    const potentialOvers = Math.ceil(minutesBetween / 4.25);
    document.getElementById('potentialOvers').textContent = potentialOvers;
    
    const resultElement = document.getElementById('table2Result');
    if (resultElement) {
        if (potentialOvers > oversFaced) {
            resultElement.textContent = 'Revert to Table 1 - First innings can continue';
            resultElement.style.color = '#90EE90';
        } else {
            resultElement.textContent = 'First innings is terminated - Go to Table 3';
            resultElement.style.color = '#FFB6C1';
        }
    }
}

function updateTable3Calculations() {
    // Get input values
    const table2Overs = Number(document.getElementById('table2Overs').value) || 0;
    const startTime = document.getElementById('startTime').value;
    
    // Calculate scheduled length [A*4.25] (round up fractions)
    const scheduledLength = Math.ceil(table2Overs * 4.25);
    document.getElementById('scheduledLength').textContent = scheduledLength;
    
    // Calculate scheduled cessation time [C + B]
    const cessationTime = addMinutesToTime(startTime, scheduledLength);
    document.getElementById('cessationTime').textContent = cessationTime || '';
    
    // Calculate maximum overs per bowler [A/5]
    const oversDistribution = calculateOversDistribution(table2Overs);
    if (typeof oversDistribution === 'string') {
        document.getElementById('maxOversBowler').textContent = oversDistribution;
    } else {
        document.getElementById('maxOversBowler').textContent = oversDistribution.join(',');
    }
    
    // Calculate powerplay overs
    const powerplayOversDistribution = calculatePowerplayOvers(table2Overs);
    if (typeof powerplayOversDistribution === 'string') {
        document.getElementById('powerplayOvers').textContent = powerplayOversDistribution;
    } else {
        document.getElementById('powerplayOvers').textContent = powerplayOversDistribution.join(',');
    }
}

function updateTable4Calculations() {
    const startInningsTime = document.getElementById('startInningsTime').value;
    const startInterruptionTime = document.getElementById('startInterruptionTime').value;
    const restartTime = document.getElementById('restartTime').value;
    const additionalTime = Number(document.getElementById('additionalTime').value) || 0;
    const maxOvers = Number(document.getElementById('maxOvers').value) || 0;

    // Calculate time innings in progress (C = B-A)
    const inningsProgressTime = calculateTimeDifference(startInningsTime, startInterruptionTime);
    document.getElementById('inningsProgressTime').textContent = inningsProgressTime;

    // Calculate length of interruption (E = D-B)
    const lengthInterruption = calculateTimeDifference(startInterruptionTime, restartTime);
    document.getElementById('lengthInterruption').textContent = lengthInterruption;

    // Calculate total playing time lost (G = E-F)
    const totalTimeLost = Math.max(0, lengthInterruption - additionalTime);
    document.getElementById('totalTimeLost').textContent = totalTimeLost;

    // Calculate overs lost [G/4.25] (rounded down)
    const oversLost = Math.floor(totalTimeLost / 4.25);
    document.getElementById('oversLost').textContent = oversLost;

    // Calculate adjusted maximum length of innings (J = H-I)
    const adjustedLength = Math.max(0, maxOvers - oversLost);
    document.getElementById('adjustedLength').textContent = adjustedLength;

    // Calculate rescheduled length of innings [J*4.25] (rounded up)
    const rescheduledLength = Math.ceil(adjustedLength * 4.25);
    document.getElementById('rescheduledLength').textContent = rescheduledLength;

    // Calculate amended cessation time (L = D + (K-C))
    const remainingTime = rescheduledLength - inningsProgressTime;
    const amendedCessationTime = addMinutesToTime(restartTime, remainingTime);
    document.getElementById('cessationTime').textContent = amendedCessationTime || '';

    // Calculate maximum overs per bowler [J/5]
    const oversDistribution = calculateOversDistribution(adjustedLength);
    if (typeof oversDistribution === 'string') {
        document.getElementById('maxOversBowler').textContent = oversDistribution;
    } else {
        document.getElementById('maxOversBowler').textContent = oversDistribution.join(',');
    }

    // Calculate powerplay overs
    const powerplayOversDistribution = calculatePowerplayOvers(adjustedLength);
    if (typeof powerplayOversDistribution === 'string') {
        document.getElementById('powerplayOvers').textContent = powerplayOversDistribution;
    } else {
        document.getElementById('powerplayOvers').textContent = powerplayOversDistribution.join(',');
    }
}