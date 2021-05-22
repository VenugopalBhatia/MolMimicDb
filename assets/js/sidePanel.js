function openNav() {
    document.getElementById("mySidepanel").style.width = "800px";
    document.getElementsByClassName('openbtn')[0].style.right = "800px";
}
  /* Set the width of the sidebar to 0 (hide it) */
  function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
    document.getElementsByClassName('openbtn')[0].style.right = "0";
    
  }