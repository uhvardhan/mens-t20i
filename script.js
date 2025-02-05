
document.addEventListener('DOMContentLoaded', function() {
    updateCalculations();
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

function updateCalculations() {
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
        const distributionText = oversDistribution.join(',');
        document.getElementById('maxOverperBowlerResult').textContent = distributionText;
    }

    const powerplayOversDistribution = calculatePowerplayOvers(maxOversPerTeam);
    if (typeof powerplayOversDistribution === 'string') {
        document.getElementById('powerplayOversResult').textContent = powerplayOversDistribution;
    } else {
        const distributionText = powerplayOversDistribution.join(',');
        document.getElementById('powerplayOversResult').textContent = distributionText;
    }

    const inningsLength = Math.ceil(maxOversPerTeam * 4.25);
    document.getElementById('lengthInningsTime').textContent = inningsLength;

    updateTimeCalculations();
}

// Add event listener for the time input
document.getElementById('recommenceTime').addEventListener('change', updateCalculations);

// Add event listeners for Table 2 calculations
document.addEventListener('DOMContentLoaded', function() {
    // Add to existing event listeners without removing them
    const restartTimeInput = document.getElementById('restartTime');
    const cutOffTimeInput = document.getElementById('cutOffTime');
    const oversFacedInput = document.getElementById('oversFaced');

    if (restartTimeInput) restartTimeInput.addEventListener('change', updateTable2);
    if (cutOffTimeInput) cutOffTimeInput.addEventListener('change', updateTable2);
    if (oversFacedInput) oversFacedInput.addEventListener('input', updateTable2);

    // Initial calculation for Table 2
    updateTable2();
});

function getMinutesBetweenTimes(time1, time2) {
    if (!time1 || !time2) return 0;
    
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    const date1 = new Date();
    const date2 = new Date();
    
    date1.setHours(hours1, minutes1, 0);
    date2.setHours(hours2, minutes2, 0);
    
    // Handle cases where the cut-off time is on the next day
    if (date2 < date1) {
        date2.setDate(date2.getDate() + 1);
    }
    
    return Math.round((date2 - date1) / (1000 * 60));
}

function updateTable2() {
    // Get input values
    const restartTime = document.getElementById('restartTime').value;
    const cutOffTime = document.getElementById('cutOffTime').value;
    const oversFaced = Number(document.getElementById('oversFaced').value) || 0;
    
    // Calculate minutes between restart time and cut-off time (R)
    const minutesBetween = getMinutesBetweenTimes(restartTime, cutOffTime);
    document.getElementById('minutesBetween').textContent = minutesBetween;
    
    // Calculate potential overs [R/4.25] (round up fractions) (S)
    const potentialOvers = Math.ceil(minutesBetween / 4.25);
    document.getElementById('potentialOvers').textContent = potentialOvers;
    
    // Compare potential overs with overs faced to determine next steps
    const resultElement = document.getElementById('table2Result');
    if (resultElement) {
        if (potentialOvers > oversFaced) {
            resultElement.textContent = 'Revert to Table 1 - First innings can continue';
            resultElement.style.color = '#90EE90'; // Light green
        } else {
            resultElement.textContent = 'First innings is terminated - Go to Table 3';
            resultElement.style.color = '#FFB6C1'; // Light red
        }
    }
}