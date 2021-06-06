

var domainMotifSelect = $('input[type=radio][name="domainMotifSelection"]').change(function(){
    var domainMotifSelected = $('input[name="domainMotifSelection"]:checked').val()
    $('#bacteria_table').prop('checked',true);
    $('#bacteria_table').val(`bacteria_${domainMotifSelected}pair`)
    $('#fungus_table').val(`fungus_${domainMotifSelected}pair`)
    $('#virus_table').val(`virus_${domainMotifSelected}pair`)
    $('#others_table').val(`others_${domainMotifSelected}pair`)
});


var tableSelect = $('input[type=radio]').change(function(){
    console.log('change triggered')
    var pathogenTableSelected = $('input[name="pathogenSelection"]:checked').val()
    $.ajax({
        type:'get',
        url: 'query/get-dropdown/',
        data:{
            pathogenTable:pathogenTableSelected
        },
        async:false,
        success: function(resData){
            // var htmlData = createDropdownInDOM(resData["data"],"tableColumns","");
            // var htmlData = '<select id="tableColumns" name="tableColumns" style = "width: 100%"></select>'
            // console.log(htmlData)
            $('#tableColumns').attr("visibility:true");
            let htmlData = '<select id="tableColumns" name="tableColumns" style = "width: 100%"></select>'
            $('.tableColumns').html(htmlData);
            $('#tableColumns').change(searchByColumn).change();
            let rowVals = resData['data']
            $("#tableColumns").select2({
                theme: "bootstrap-5",
                placeholder:"Select or Type",
                data: rowVals
            });
            $("#tableColumns").val(null).trigger('change');



        }

    })
    
    
})

$('input[name=pathogenSelection').change(function(){
    // console.log("Changed Table selection")
    if(!$('input[name="domainMotifSelection"]:checked').length){
        $('#domain_radio').prop('checked',true)
    }
    if($("#tableColumns").length){
        $('#tableColumns').val(null).trigger('change');
        
    }
    if($("#searchByColumn").length){
        $('#searchByColumn').val(null).trigger('change');
    }
    

})

// $('#getCSV').click(downloadData)

function searchByColumn(){
    let selectedVal = $(this).val();
    // console.log(selectedVal);
    var htmlData = "";
    if(selectedVal == null){
        null;
    // }else if(selectedVal == 'Pathogen Protein ID'){
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
                // let rowVals = [];
                let FieldVals = resData['data']
                // console.log(FieldVals)
                // rowVals = FieldVals.map(function(row){ return row[selectedVal] })
                
                // for(let i of resData['data']){
                //     for(let key in i){
                //         rowVals.push(i[key])
                //     }
                // }
                
                
                // htmlData = createDropdownInDOM(rowVals,"searchByColumn","multiple")
                // '<select id="searchByColumn" name="searchByColumn" style = "width: 100%"></select>'
                htmlData = '<select id="searchByColumn" name="searchByColumn" style = "width: 100%"></select>'
                // console.log("HTML Data dropdown",htmlData)  
                $('.searchByColumn').html(htmlData);
                // $('#searchByColumn').selectize()
                $('#searchByColumn').attr("");
                $('#searchByColumn').select2({
                    
                    theme: "bootstrap-5",
                    placeholder:"Select or Type",
                    multiple: true,
                    tags:true,
                    data: FieldVals,
                    allowClear: false,
                    tokenSeparators : [','," ",", ",";"],
                    maximumSelectionLength:10
                    // createTag: function (params) {
                    //     // Don't offset to create a tag if there is no @ symbol
                    //     if (params.term in rowVals) {
                    //       // Return null to disable tag creation
                    //       return {
                    //         id: params.term,
                    //         text: params.term
                    //       }
                    //     }
                    //     return null;
                    
                       
                    //   }
                });
                
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

$('#refresh-captcha').on('click',function(event){
    event.preventDefault();
    console.log('button clicked')
    $.ajax({
        type:'get',
        url:'/Captcha.jpg',
        success:function(){
            $('#captcha>div>img').attr("src",'/Captcha.jpg')
        }
    })
})



// function downloadData(){
//     $.ajax({
//         type:'get',
//         url :'/query/getCSVData',
//         success: function(resp_data){
//             console.log('*****',resp_data)
//             JSONToCSVConvertor(resp_data['data'],true)
//         },
//         error: function(resp){
//             console.log(error)
//         }
    

//     })

// }

// var createSearchBarInDOM = function(id){
//     var htmlString = `<input type = "text" id=${id} name=${id} ></input>`
//     return htmlString;
// }

// $(document).ready(function(){
    
    
    
    

// })

// function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {

//     //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
//     // console.log('*****',JSONData)
//     var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
//     var CSV = '';
//     //This condition will generate the Label/Header
//     if (ShowLabel) {
//         var row = "";

//         //This loop will extract the label from 1st index of on array
//         for (var index in arrData[0]) {
//             //Now convert each value to string and comma-seprated
//             row += index + ',';
//         }
//         row = row.slice(0, -1);
//         //append Label row with line break
//         CSV += row + '\r\n';
//     }

//     // console.log(arrData)
//     //1st loop is to extract each row
//     for (var i = 0; i < arrData.length; i++) {
        
//         var row = "";
//         //2nd loop will extract each column and convert it in string comma-seprated
//         for (var index in arrData[i]) {
//             row += '"' + arrData[i][index] + '",';
//         }
//         row.slice(0, row.length-1);
//         //add a line break after each row
//         CSV += row + '\r\n';
//     }

//     if (CSV == '') {
//         alert("Invalid data");
//         return;
//     }

//     //this trick will generate a temp "a" tag
//     var link = document.createElement("a");
//     link.id = "lnkDwnldLnk";

//     //this part will append the anchor tag and remove it after automatic click
//     document.body.appendChild(link);

//     var csv = CSV;
//     let blob = new Blob([csv], { type: 'text/csv' });
//     var csvUrl = window.webkitURL.createObjectURL(blob);
//     var filename =  (ReportTitle || 'UserExport') + '.csv';
//     $("#lnkDwnldLnk")
//         .attr({
//             'download': filename,
//             'href': csvUrl
//         });

//     $('#lnkDwnldLnk')[0].click();
//     // document.body.removeChild(link);
// }





