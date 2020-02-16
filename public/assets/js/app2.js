$(document).ready(function () {

    //function to post a note to server
    function sendNote(element) {
      let note = {};
      note.articleId = $(element).attr('data-id'),
      note.text = $('#noteText').val().trim();
        $.ajax({
          url: '/notes/save',
          type: 'POST',
          data: note,
          success: function (response){
            showNote(response, note.articleId);
            $('#noteText').val('');
          },
          error: function (error) {
            showErrorModal(error);
          }
        });
    }//end of sendNote function
  
  
    //function to display error modal on ajax error
    function showErrorModal(error) {
      $('#error').modal('show');
    }
  
  
    //function to display notes in notemodal
    function showNote(element, articleId){
      let $deleteButton = $('<button>')
        .text('X')
        .addClass('deleteNote');
      let $note = $('<div>')
        .append($deleteButton)
        .attr('data-note-id', element._id)
        .attr('data-article-id', articleId)
        .addClass('note')
        .appendTo('#noteArea');
    }//end of showNote function
  
    //event listener to reload root when user closes modal showing
    //number of scraped articles
    $('#alertModal').on('hide.bs.modal', function (e) {
      window.location.href = '/';
    });
  
    //click event to scrape new articles
    $('#scrape').on('click', function (e){
      $('#loader').css({ 'display': 'block' });
      e.preventDefault();
      $.ajax({
        url: '/scrape',
        type: 'GET',
        success: function (response) {
          for (var i = 0; i < response.length; i++) {
            // Display the apropos information on the page
          
            var panelDiv = $("<div>").addClass("panel panel-default");
            var titleDiv = $$("<div>").addClass("panel-heading");
            var title = $("<h4>").text(this.title);
            var link = $("<a>").href("'" + this.link + "'");
            var bodyDiv = $("<div>").addClass("panel-body");
            var summary = $("<p>").text(this.summary);
            var button = $("<button>").addClass("button").attr("id", "saveArticle").data("id", this._id).text("Save Article");

            $("#articles").append(panelDiv);
            $(panelDiv).append(titleDiv);
            $(titleDiv).append(title);
            $(title).append(link);

            $("#articles").append(bodyDiv);
            $(bodyDiv).append(summary);
            $(bodyDiv).append(button);

          }
        },
        error: function (error) {
          showErrorModal(error);
        },
        complete: function (result){
          $('#loader').css({ 'display': 'none' });
          $('#alertModal').modal('show');
        }
      });
    });//end of #scrape click event
  
    //click event to save an article
    $(document).on('click', '#saveArticle', function (e) {
      let articleId = $(this).data('id');
      $.ajax({
        url: '/articles/save/'+articleId,
        type: 'GET',
        success: function (response) {
          for (var i = 0; i < response.length; i++) {
            // Display the apropos information on the page
          
            var panelDiv = $("<div>").addClass("panel panel-default");
            var titleDiv = $$("<div>").addClass("panel-heading");
            var title = $("<h4>").text(this.title);
            var link = $("<a>").href("'" + this.link + "'");
            var bodyDiv = $("<div>").addClass("panel-body");
            var summary = $("<p>").text(this.summary);
            var button = $("<button>").addClass("button").attr("id", "saveArticle").data("id", this._id).text("Save Article");

            $("#savedArticles").append(panelDiv);
            $(panelDiv).append(titleDiv);
            $(titleDiv).append(title);
            $(title).append(link);

            $("#savedArticles").append(bodyDiv);
            $(bodyDiv).append(summary);
            $(bodyDiv).append(button);

          }

          window.location.href = '/saved';
        },
        error: function (error) {
          showErrorModal(error);
        }
      });
    });//end of #saveArticle click event
  
    //click event to open note modal and populate with notes
    $('.addNote').on('click', function (e){
      $('#noteArea').empty();
      $('#noteText').val('');
      let id = $(this).data('id');
      $('#submitNote, #noteText').attr('data-id', id);
      $.ajax({
        url: '/notes/getNotes/'+id,
        type: 'GET',
        success: function (data){
          $.each(data.notes, function (i, item){
            showNote(item, id);
          });
          $('#noteModal').modal('show');
        },
        error: function (error) {
          showErrorModal(error);
        }
      });
    });//end of .addNote click event
  
    //click event to create a note
    $('#submitNote').on('click', function (e) {
      e.preventDefault();
      sendNote($(this));
    });//end of #submitNote click event
  
    //keypress event to allow user to submit note with enter key
    $('#noteText').on('keypress', function (e) {
      if(e.keyCode === 13){
        sendNote($(this));
      }
    });
  
    //click event to delete an article from savedArticles
    $('.deleteArticle').on('click', function (e){
      e.preventDefault();
      let id = $(this).data('id');
      $.ajax({
        url: '/articles/deleteArticle/'+id,
        type: 'DELETE',
        success: function (response) {
          window.location.href = '/articles/viewSaved';
        },
        error: function (error) {
          showErrorModal(error);
        }
      });
    });//end of .deleteArticle click event
  
    //click event to delete a note from a saved article
    $(document).on('click', '.deleteNote', function (e){
      e.stopPropagation();
      let thisItem = $(this);
      let ids= {
        noteId: $(this).parent().data('note-id'),
        articleId: $(this).parent().data('article-id')
      };
  
      $.ajax({
        url: '/notes/deleteNote',
        type: 'POST',
        data: ids,
        success: function (response) {
          thisItem.parent().remove();
        },
        error: function (error) {
          showErrorModal(error);
        }
      });
    });//end of .deleteNote click event
  
    //click event to retrieve the title and body of a single note
    //and populate the note modal inputs with it
    $(document).on('click', '.note', function (e){
      e.stopPropagation();
      let id = $(this).data('note-id');
      $.ajax({
        url: '/notes/getSingleNote/'+id,
        type: 'GET',
        success: function (note) {
          $('#noteText').val(note.text);
        },
        error: function (error) {
          console.log(error);
          showErrorModal(error);
        }
      });
    }); //end of .note click event
  
  });//end of document ready function