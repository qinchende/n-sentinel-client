// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Utils
// coming from child_process.js
exports.normalizeExecArgs = function(command /*, options, callback*/) {
    var options;
    var callback;

    if (typeof arguments[1] === 'function') {
        options = undefined;
        callback = arguments[1];
    } else {
        options = arguments[1];
        callback = arguments[2];
    }

    // Make a shallow copy so we don't clobber the user's options object.
    options = Object.assign({}, options);
    options.shell = typeof options.shell === 'string' ? options.shell : true;

    return {
        file: command,
        options: options,
        callback: callback
    };
};