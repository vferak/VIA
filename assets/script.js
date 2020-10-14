let $lectures = $('.lecture');
let $classes = $('.class');

$('[data-lectures-highlight]').click(function () {
    $lectures.css('background-color', '#b10000');
    $classes.css('background-color', '#5f5fad');
});

$('[data-class-highlight]').click(function () {
    $lectures.css('background-color', '#a94949');
    $classes.css('background-color', '#2e2eab');
});

$('[data-remove-highlight]').click(function () {
    $lectures.css('background-color', '#b10000');
    $classes.css('background-color', '#2e2eab');
});

class ScheduleTimer {
    constructor(start, end) {
        this.lastDayNumber = 5;

        this.secondsInAMinute = 60;
        this.secondsInAnHour = 60 * this.secondsInAMinute;

        this.secondsInAClass = 90 * this.secondsInAMinute;
        this.secondsInABreak = 15 * this.secondsInAMinute;
        this.secondsInClassAndBreak = this.secondsInAClass + this.secondsInABreak;

        this.firstAvailableSecond = (start.split(':')[0] * this.secondsInAnHour) + (start.split(':')[1] * this.secondsInAMinute);
        this.lastAvailableSecond = (end.split(':')[0] * this.secondsInAnHour) + (end.split(':')[1] * this.secondsInAMinute);

        this.availableSeconds = this.lastAvailableSecond - this.firstAvailableSecond;
        this.numberOfClasses = Math.floor(this.availableSeconds / this.secondsInClassAndBreak)
        this.secondsInAllBreaks = this.numberOfClasses * this.secondsInABreak;
        this.availableSeconds -= this.secondsInAllBreaks;
    }

    process() {
        let date = new Date();

        this.setTimeHTML(date);

        let seconds = this.getCurrentSeconds(date);
        let day = date.getDay();

        let $timeIndicator = $('.time-indicator');

        if (seconds < this.firstAvailableSecond || seconds > this.lastAvailableSecond || day > this.lastDayNumber) {
            $timeIndicator.hide();
        } else {
            let $table = $('.table');
            let $firstColumn = $('.table table tbody tr:nth-child(' + day + ') td:first-child');

            $timeIndicator.css('left', this.getX($table, $firstColumn, $timeIndicator, seconds));
            $timeIndicator.css('top', $firstColumn.position().top);
            $timeIndicator.css('height', $firstColumn.outerHeight());
            $timeIndicator.show();
        }
    }

    setTimeHTML(date) {
        $('[data-date]').html(date.toLocaleString('cs-CS'));
    }

    getCurrentSeconds(date) {
        return (date.getHours() * this.secondsInAnHour) + (date.getMinutes() * this.secondsInAMinute) + date.getSeconds();
    }

    getX($table, $firstColumn, $timeIndicator, seconds) {
        let firstColumnWidth = $firstColumn.outerWidth();
        let usableWidth = $table.width() - firstColumnWidth;

        let secondPerPixel = this.availableSeconds / usableWidth;
        let secondsFromScheduleStart = seconds - this.firstAvailableSecond;

        let currentClass = Math.floor(secondsFromScheduleStart / this.secondsInClassAndBreak);
        let secondsInClass = secondsFromScheduleStart % this.secondsInClassAndBreak;

        let isBreak = secondsInClass > this.secondsInAClass;

        if (isBreak) {
            secondsFromScheduleStart += this.secondsInClassAndBreak - secondsInClass;
            currentClass += 1;
        }

        secondsFromScheduleStart -= currentClass * this.secondsInABreak;
        return (secondsFromScheduleStart / secondPerPixel) + firstColumnWidth;
    }
}

$(document).ready(function () {
    let scheduleTimer = new ScheduleTimer('7:15', '18:30');

    scheduleTimer.process();

    setInterval(function() {
        scheduleTimer.process();
    }, 1000);
});

