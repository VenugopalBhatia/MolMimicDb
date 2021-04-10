$('input[type=radio][name="domainMotifSelection"]').change(function(){
    var domainMotifSelected = $('input[name="domainMotifSelection"]:checked').val()
    $('#bacteria_table').prop('checked',true);
    $('#bacteria_table').val(`bacteria_${domainMotifSelected}pair`)
    $('#fungus_table').val(`fungus_${domainMotifSelected}pair`)
    $('#virus_table').val(`virus_${domainMotifSelected}pair`)
    $('#others_table').val(`others_${domainMotifSelected}pair`)
});

$('input[type=radio][name="domainMotifSelection"]').change(function(){
    var pathogenTableSelected = $('input[name="pathogenSelection"]:checked').val()
    $.ajax({
        type:'get',
        url: 'query/get-dropdown/',
        data:{
            pathogenTable:pathogenTableSelected
        },
        success: function(resData){
            var htmlData = createDropdownInDOM(resData["data"]);
            console.log(htmlData)
            if($('#tableColumns').length!=0){
                $('#tableColumns').replaceWith(htmlData)
            }else{
                console.log("htmlData appending",htmlData)
                $('#columnSelection').append(htmlData)
            }
            
        }
    })
})

var createDropdownInDOM  = function(data){
    var htmlString = '<select id="tableColumns" name="tableColumns"> <option> No Filter Selected </option>'
    for(var row of data){ 
        htmlString+=`<option> ${row} </option>`
    }
    return htmlString;
}


