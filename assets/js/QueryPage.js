var domainMotifSelect = $('input[type=radio][name="domainMotifSelection"]').change(function(){
    var domainMotifSelected = $('input[name="domainMotifSelection"]:checked').val()
    $('#bacteria_table').prop('checked',true);
    $('#bacteria_table').val(`bacteria_${domainMotifSelected}pair`)
    $('#fungus_table').val(`fungus_${domainMotifSelected}pair`)
    $('#virus_table').val(`virus_${domainMotifSelected}pair`)
    $('#others_table').val(`others_${domainMotifSelected}pair`)
});


var tableSelect = $('input[type=radio][name="domainMotifSelection"]').change(function(){
    var pathogenTableSelected = $('input[name="pathogenSelection"]:checked').val()
    $.ajax({
        type:'get',
        url: 'query/get-dropdown/',
        data:{
            pathogenTable:pathogenTableSelected
        },
        async:false,
        success: function(resData){
            var htmlData = createDropdownInDOM(resData["data"],"tableColumns","");
            // console.log(htmlData)
            $('.tableColumns').html(htmlData);
            $('#tableColumns').change(searchByColumn).change();
            $("#tableColumns").select2();
        }

    })
    
    
})

$('input[name=pathogenSelection').change(function(){
    // console.log("Changed Table selection")
    if($("#tableColumns").length){
        $('#tableColumns').val(null).trigger('change');
        
    }
    if($("#searchByColumn").length){
        $('.searchByColumn').html("");
    }
    

})



function searchByColumn(){
    let selectedVal = $(this).val();
    // console.log(selectedVal);
    var htmlData = "";
    if(selectedVal == null){
        null;
    // }else if(selectedVal == 'Pathogen_ID'){
    //     htmlData = createSearchBarInDOM("searchByColumn");
    }else{
        let pathogenTableSelected = $('input[name="pathogenSelection"]:checked').val()
        $.ajax({
            type:'get',
            url: 'query/get-columnValues/',
            data:{
                pathogenTable:pathogenTableSelected,
                column: selectedVal
            },
            async:false,
            success: function(resData){
                let rowVals = [];
                for(let i of resData['data']){
                    for(let key in i){
                        rowVals.push(i[key])
                    }
                }
                
                
                htmlData = createDropdownInDOM(rowVals,"searchByColumn","multiple")
                // console.log("HTML Data dropdown",htmlData)  
                $('.searchByColumn').html(htmlData);
                $('#searchByColumn').select2(); 
            },
            error: function(err){
                console.log("Error: ",err);
            }
        })
        
        
    }
    // console.log("HTML Data",htmlData)
    
    
}

var createDropdownInDOM  = function(data,id,type){
    var htmlString = `<select id="${id}" name="${id}" ${type} style = "width: 100%"> `
    for(var row of data){ 
        htmlString+=`<option> ${row} </option>`
    }
    htmlString+="</select>"
    return htmlString;
}

var createSearchBarInDOM = function(id){
    var htmlString = `<input type = "text" id=${id} name=${id} ></input>`
    return htmlString;
}

$(document).ready(function(){
    

})




