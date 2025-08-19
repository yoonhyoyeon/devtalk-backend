export const parseTimeToMs = (timeStr: string):number => {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));

    switch(unit) {
        case 'd': return value*24*60*60*1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        case 's': return value * 1000;
        default: throw new Error('Invalid time format');
    }
}