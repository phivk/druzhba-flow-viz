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
function set_slider_params(prop, min, max, step, value) {
    var sliders = document.getElementsByClassName('slider '+prop);
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
function set_state(prop, value) {
    // set js var value
    propVal = parseFloat(value);
    state[prop] = propVal;

    if (prop === "v0_x") { blobCurve.setV0( createVector(propVal,                    blobCurve.beziercurve.v0.y )); }
    if (prop === "v0_y") { blobCurve.setV0( createVector(blobCurve.beziercurve.v0.x, propVal                    )); }
    if (prop === "v3_x") { blobCurve.setV3( createVector(propVal,                    blobCurve.beziercurve.v3.y )); }
    if (prop === "v3_y") { blobCurve.setV3( createVector(blobCurve.beziercurve.v3.x, propVal                    )); }

    // console.log(state);

    // set URLParameter
    set_url_parameter(prop, value, urlParams);

    // sync all slider inputs
    // var sliders_for_prop = document.getElementsByClassName('slider '+prop);
    // for (var i = 0; i < sliders_for_prop.length; i++) {
    //     sliders_for_prop[i].value = propVal;
    // }
}

