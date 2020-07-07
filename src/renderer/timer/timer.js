const { ipcRenderer } = require('electron');
const moment = require('moment');

const list = [];
const timerMap = new Map();


for (let i = 0; i < 20; i++) {
    list.push('00:00:00');
}

ipcRenderer.on('time', (event, usb, isStart) => {

    // console.log(usb, isStart);
    if (isStart) {

        if (timerMap.get(`timer_${usb}`) === undefined) {

            timerMap.set(`timer_${usb}`, setInterval(() => {
                let next = moment(list[usb], 'HH:mm:ss').add(1, 's').format('HH:mm:ss');
                list[usb] = next;
                // console.log(`${usb}:${list[usb]}`);
                ipcRenderer.send('receive-time', usb, list[usb]);
            }, 950));
        }

    } else {
        clearInterval(timerMap.get(`timer_${usb}`));
        timerMap.delete(`timer_${usb}`);
        list[usb] = '00:00:00';
    }

    console.log(list);
});