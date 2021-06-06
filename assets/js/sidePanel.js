function openNav() {
    document.getElementById("sidepanelQueryForm").style.display = "block"
    if($(window).width() <= 800){
      document.getElementById("mySidepanel").style.width = "90vw";
      document.getElementsByClassName('openbtn')[0].style.right = "90vw";

    }else{
      document.getElementById("mySidepanel").style.width = "800px";
      document.getElementsByClassName('openbtn')[0].style.right = "800px";

    }
    
}
  /* Set the width of the sidebar to 0 (hide it) */
  function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
    document.getElementsByClassName('openbtn')[0].style.right = "0";
    document.getElementById("sidepanelQueryForm").style.display = "none"
    
  }