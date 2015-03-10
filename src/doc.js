/*!
 * doc.js
 *
 * Use for document page.
 *
 * Author: david
 *
 * Date: 2015-03-06
 */

(function ($) {


    // resize #side-nav and #content
    function resizeMainBlock () {
      var main_height = $(window).height() - $('#nav-content').height() - 80;
      $('#side-nav').height(main_height);
      $('#content').height(main_height);
    };
    resizeMainBlock();
    $(window).on('resize', function() {
      resizeMainBlock();
    });


    var url = new lib.httpurl(window.location.href);
    function getDoc () {   
      return $.get(url.params.file, function(data){   
        console.log('get doc success');   
      });  
    };

    function clickLevelTag (e) {
      var that = $(this);
      if (that.hasClass('sub-level-tag-close')) {
        that.removeClass('sub-level-tag-close');
        that.addClass('sub-level-tag-open');
        var t = $('[data-level-root='+ that.attr('data-level-sub') +']')
        t.show();
        t.next('.sub-level-tag-wrapper').children('.sub-level-tag').show();
        return;
      } 
      if (that.hasClass('sub-level-tag-open')) {
        that.removeClass('sub-level-tag-open');
        that.addClass('sub-level-tag-close');
        var t = $('[data-level-root^='+ that.attr('data-level-sub') +']')
        t.hide();
        t.next('.sub-level-tag-wrapper').children('.sub-level-tag').removeClass('sub-level-tag-open');
        t.next('.sub-level-tag-wrapper').children('.sub-level-tag').addClass('sub-level-tag-close');
        t.next('.sub-level-tag-wrapper').children('.sub-level-tag').hide();
        return;
      }
    }

    function renderPage (rets) {

      // clean content create by page script
      // var sideNav = document.querySelector('#side-nav');
      // sideNav.innerHTML = "";
      // var target = document.querySelector('#content');
      // target.innerHTML = "";


      var content = document.createElement("div");
      content.innerHTML = markdown.toHTML(rets);


      var tree = { children:[],content:[] };
      var stack = [tree];
      var index = [];
      var breadcrumb = "";
      var curr;
      for(var i = 0; i < content.children.length; i++) {
        var ele = content.children[i];
        //console.log(ele);
        if(ele.tagName.match(/H(\d)/)) {
          var level = parseInt(RegExp.$1);
          while(stack.length > level) {
            stack.pop();
          }
          curr = stack[stack.length - 1];
          var node = {
            content:[ele],
            header:ele,
            children:[],
            href:(curr.href!==undefined) ? curr.href + "-" + (curr.children.length+1) : (curr.children.length+1)
          };

          index.push({
            title: Array(stack.length+1).join('    ') + ele.innerText,
            origin_title: ele.innerText,
            href:node.href,
            sub_level: (node.href+'').replace(/[^-]/g,'').length
          });

          stack.push(node);
          curr.children.push(node);
        } else {
          curr = stack[stack.length - 1];
          curr.content.push(ele);
        }
      }
      var sideNav = document.querySelector('#side-nav');

      for(var i = 0; i < index.length; i++) {
        if (index[i].sub_level > 1 ) {

          if (index[i].sub_level > index[i-1].sub_level) {
            var sub_tag = document.createElement('div');
            sub_tag.setAttribute('data-level-sub', index[i].href.substring(0, index[i].href.lastIndexOf('-')));
            sub_tag.className = 'sub-level-tag sub-level-tag-close';
            var sub_tag_wrapper = document.createElement('div');
            sub_tag_wrapper.className = 'sub-level-tag-wrapper';
            sub_tag_wrapper.appendChild(sub_tag);
            sideNav.appendChild(sub_tag_wrapper);
            if (index[i].sub_level > 2 ) {
              $(sub_tag).hide();
            }
          }

          var a = document.createElement('a');
          a.href = "#" + index[i].href;
          a.innerText = index[i].title;
          a.setAttribute('data-level-root', index[i].href.substring(0, index[i].href.lastIndexOf('-')));
          sideNav.appendChild(a);
          $(a).hide();
          
        } else {
          var a = document.createElement('a');
          a.href = "#" + index[i].href;
          a.innerText = index[i].title;
          sideNav.appendChild(a);
        }
      }
      $('.sub-level-tag').on('click', clickLevelTag);

      //console.log(index);
      var target = document.querySelector('#content')
      var curr = tree;
     
      function render(node) {
          for(var i = 0; i < node.content.length; i++) {
              target.appendChild(node.content[i]);
          }
          for(var i = 0; i < node.children.length; i++) {
              render(node.children[i]);
          }
      }

      function makeBreadcrumbLink (node) {
          var blink = document.createElement('a');
          blink.href = "#" + node.href;
          blink.innerText = node.header.innerText;
          return blink;
      }

      function makePaginationBlock(hash, block) {
        if (hash) {
          for(var i = 0; i < index.length; i++) {
            if (index[i].href == window.location.hash.replace("#","")) {
              var prev, next;
              var sep_tag = document.createElement('span');
              sep_tag.innerText = ' / ';

              if (i == 0) {
                var prev = document.createElement('span');
                prev.innerText = '前一页';
                var next = document.createElement('a');
                next.href = "#" + index[i+1].href;
                next.innerText = '后一页';
              }else if (i == (index.length-1)) {
                var prev = document.createElement('a');
                prev.href = "#" + index[i-1].href;
                prev.innerText = '前一页';
                var next = document.createElement('span');
                next.innerText = '后一页';
              }else {
                var prev = document.createElement('a');
                prev.href = "#" + index[i-1].href;
                prev.innerText = '前一页';
                var next = document.createElement('a');
                next.href = "#" + index[i+1].href;
                next.innerText = '后一页';
              }

              block.appendChild(prev);
              block.appendChild(sep_tag);
              block.appendChild(next);
            }
          }
        
        }else {
          var prev = document.createElement('span');
          prev.innerText = '前一页';
          var sep_tag = document.createElement('span');
          sep_tag.innerText = ' / ';
          var next = document.createElement('a');
          next.href = "#" + index[1].href;
          next.innerText = '后一页';

          block.appendChild(prev);
          block.appendChild(sep_tag);
          block.appendChild(next);
        }

      }

      function checkHash(){

          target.innerHTML = '';


          // top block
          var content_top = document.createElement('div');
          content_top.className = 'content-top';

          var breadcrumb = document.createElement('div')
          breadcrumb.className = 'doc-breadcrumb';

          var pagination_top =  document.createElement('div');
          pagination_top.className = 'doc-pagination';


          // append to top
          content_top.appendChild(breadcrumb);
          content_top.appendChild(pagination_top);


          makePaginationBlock(window.location.hash, pagination_top);


          target.appendChild(content_top);

          if(window.location.hash) {


              var pos = window.location.hash.replace("#","").split('-');
              curr = tree;
              for(var i = 0; i < pos.length; i++) {
                  var p = parseInt(pos[i]) - 1;
                  curr = curr.children[p];

                  // create breadcrumb
                  if (i < (pos.length - 1)) {
                    var blink = makeBreadcrumbLink(curr);
                    breadcrumb.appendChild(blink);
                    var blink_mark = document.createElement('span');
                    blink_mark.innerText = " > ";
                    breadcrumb.appendChild(blink_mark);
                  }else {
                    var blink = makeBreadcrumbLink(curr);
                    breadcrumb.appendChild(blink);
                  }

              }

              render(curr);
          } else {
              
              // default breadcrumb
              var blink = makeBreadcrumbLink(tree.children[0]);
              breadcrumb.appendChild(blink);

              render(tree);
          }

          // bottom block
          var content_bottom = document.createElement('div');
          content_bottom.className = 'content-bottom';

          var pagination_bottom =  document.createElement('div');
          pagination_bottom.className = 'doc-pagination';
          makePaginationBlock(window.location.hash, pagination_bottom);

          content_bottom.appendChild(pagination_bottom);

          target.appendChild(content_bottom);

      }

      window.addEventListener('hashchange',checkHash);
      checkHash();

    };

    $.when(getDoc()).then(function(rets){   
      renderPage(rets);
    }).fail(function(){   
      console.log( 'something went wrong!' );  
    });


})($);



