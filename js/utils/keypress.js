function onKeyDown(event) {
    console.log(event.key);
    var key = event.key;

    if (key >= '0' && key <= '9') {
        console.log("0-9");
        // CHANGE SET AND BANK // keys 0-9
        if (event.shiftKey) {
            changeSet(parseInt(key, 10));
        } else {
            changeBank(parseInt(key, 10));
        }
    } else if (event.key === 'ArrowUp') {
        // UP ARROW: Increment current_file and change
        changeFile(++current_file);
    } else if (event.key === 'ArrowDown') {
        // DOWN ARROW: Decrement current_file and change
        changeFile(--current_file);
    }
}

window.addEventListener('keydown', function(e) {
    if (typeof onKeyDown === 'function') onKeyDown(e);
});
