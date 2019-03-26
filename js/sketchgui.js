/*
 * set url parameters
 */
function set_url_parameter(prop, value, urlParams) {
    urlParams.set(prop, value);
    window.history.replaceState({}, '', window.location.pathname + '?' + urlParams);
}

/*
 * initialise input elements on page
 */
function set_slider_params(propPath, min, max, step, value) {
    var sliders = document.getElementsByClassName('slider '+propPath);

    // set all sliders identical
    for (var i = 0; i < sliders.length; i++) {
        sliders[i].min       = min;
        sliders[i].max       = max;
        sliders[i].step      = step;
        sliders[i].value     = value;
    }    
}

/*
 * handler for all range inputs
 */
function set_state(propPath, value) {
    [instanceIndex, prop] = parsePropPath(propPath);
    propVal = parseFloat(value);
    
    // set js var value
    if (instanceIndex !== undefined) {
        // state.curves[instanceIndex][prop] = propVal;
        blobCurves[instanceIndex][prop] = propVal;
    } else {
        state[prop] = propVal;
    }

    // set URLParameter
    // set_url_parameter(prop, value, urlParams);

    // sync all slider inputs
    // var sliders_for_prop = document.getElementsByClassName('slider '+prop);
    // for (var i = 0; i < sliders_for_prop.length; i++) {
    //     sliders_for_prop[i].value = propVal;
    // }
}

function parsePropPath(propPath) {
    let parts = propPath.split('.');
    if (parts.length == 1) {
        return [undefined, parts[0]];
    } else if (parts.length == 2) {
        return [parts[0], parts[1]];
    } else {
        console.error('propPath should contain at most two dots (.)')
    }
}

function toggleGUI() {
    let uiSelector = '#ui-controls';
    let uiElement = document.querySelector(uiSelector);
    uiElement.classList.toggle('dn');
}