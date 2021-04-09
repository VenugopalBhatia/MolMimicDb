$('input[type=radio][name="domainMotifSelection"]').change(function(){
    var domainMotifSelected = $('input[name="domainMotifSelection"]:checked').val()
    $('#bacteria_table').val(`bacteria_${domainMotifSelected}pair`)
    $('#fungus_table').val(`fungus_${domainMotifSelected}pair`)
    $('#virus_table').val(`virus_${domainMotifSelected}pair`)
    $('#others_table').val(`others_${domainMotifSelected}pair`)
});

$('input[type=radio][name="pathogenSelection"]').change(function(){
    var pathogenTableSelected = $('input[name="pathogenSelection"]:checked').val()
    $.ajax({
        type:'get',
        url: 'query/get-dropdown',
        success: function(data){

        }
    })
})

// var createDropdownInDOM(data){
//     return $('<select id="tableColumns" name="tableColumns>'+
//                 '<option> No Filter Selected </option>'
//                 <% for(row in data){ %>

//                 <%}%>
    
    
    
//     `
//     )
// }


