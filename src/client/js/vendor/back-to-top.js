jQuery(function($){
  //回到顶部
  var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') :
    $('body')) : $('html,body');
  var $scrollDiv = $('#scrollTop');
  var status = 0;//是否起飞
  var statusTimer;

  $scrollDiv.hover(function () {
    $('.level-2').fadeTo(350, 1);
    $(this).css("cursor","point");
  }, function () {
    $('.level-2').fadeTo(350, 0);
    $(this).css("cursor","");
  });

  //起飞按钮
  $scrollDiv.click(function() {
    //火箭点火
    light_fire();
    //滚动条向顶部移动
    $body.animate({scrollTop: 0}, 700,null,function(){
      //火箭向上移动
      $scrollDiv.animate({top: "-40px"}, 400,null,function(){
        //火箭升空后，恢复到原来状态
        recove_status(this);
      });
    });
    return false;
  });

  //火箭点火
  function light_fire(){
    $(".level-3").show();
    status = 1;
    statusTimer = setInterval(function(){
      if(status>0){
        //更换图片，实现火焰燃烧
        status = (status+1)%4+1;
        var curX = (status + 1)*-149;
        $('.level-3').css("background-position",curX+"px 0");
      }else{
        clearInterval(statusTimer);
      }
    },50);
  }

  //火箭升空后，恢复到原来状态
  function recove_status(curNode){
    $(curNode).hide().css("top","95%");
    $(".level-3").hide();
    status = 0;
  }

  //当在顶部时，隐藏火箭
  $(document).scroll(function(){
    var bodyNode = $(this);
    if(bodyNode.scrollTop() > 60){
      //显示回到顶部
      $scrollDiv.show();
    }else{
      if(status==0)
      //如果状态不是飞行状态，隐藏火箭
        $('#scrollTop').hide();
    }
  });
});