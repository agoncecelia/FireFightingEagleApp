function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateInputs(inputClass) {
    var inputs = $('.' + inputClass);
    var isInvalid = false;

    for(var i = 0; i < inputs.length; i++){
        if($(inputs[i]).val() == ''){
            isInvalid = true;

            $(inputs[i]).css('border-color', 'red');
        }

        if($(inputs[i]).attr('type') == 'email'){
            if(!validateEmail($(inputs[i]).val())){
                isInvalid = true;

                $(inputs[i]).css('border-color', 'red');
            }
        }
    }

    if(isInvalid){
        return false
    }else{
        return true;
    }
}

function request(inputs, type, route, callback) {
    $.ajax({
        type: type,
        url: 'http://localhost:3500/' + route,
        data: inputs,
        error:function (xhr, ajaxOptions, thrownError){
            alert("Something went wrong!");
        },
        complete: callback,
    });
};