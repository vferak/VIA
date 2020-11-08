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
        this.firstDayNumber = 1;
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

        if (seconds < this.firstAvailableSecond || seconds > this.lastAvailableSecond || day > this.lastDayNumber || day < this.firstDayNumber) {
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

class Notes {
    run() {
        let self = this;

        $.each($('.lecture, .class'), function () {
            let noteId = $(this).data('note-id');
            let value = localStorage.getItem(noteId);

            let html = '<a href="#" class="noteButton">';
            html += self.getNoteInnerHtml(value !== null && value !== '');
            html += '</a>';
            $(this).append(html);
        });

        $('.noteButton').click(function (e) {
            e.preventDefault();

            let $dialog = $('[data-note-dialog]');
            let $parent = $(this).parent();
            let noteId = $parent.data('note-id');

            $dialog.data('note-dialog', noteId);

            $('[data-note-text]').val(localStorage.getItem(noteId));
            $dialog.get(0).showModal();
        });

        $(window).click(function (e) {
            let dialog = $('[data-note-dialog]').get(0);
            if (e.target === dialog) {
                dialog.close();
            }
        });

        $('[data-note-submit]').click(function (e) {
            e.preventDefault();

            let $dialog = $('[data-note-dialog]');
            let dialog = $dialog.get(0);
            let value = $('[data-note-text]').val();
            let noteId = $dialog.data('note-dialog');

            localStorage.setItem(noteId, value)

            $('[data-note-id=' + noteId + '] .noteButton').html(self.getNoteInnerHtml(value !== null && value !== ''));

            dialog.close();
        });
    }

    getNoteInnerHtml(full) {
        return full ? '<i class="fas fa-sticky-note"></i>' : '<i class="far fa-sticky-note"></i>';
    }
}

$(document).ready(function () {
    let scheduleTimer = new ScheduleTimer('7:15', '18:30');

    scheduleTimer.process();

    setInterval(function() {
        scheduleTimer.process();
    }, 1000);

    let notes = new Notes();

    notes.run();
});

