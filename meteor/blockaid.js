Blockers = new Mongo.Collection("blockers");
Comments = new Mongo.Collection("comments");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.home.helpers({
    blockers: function () {
      return Blockers.find({resolved: false});
    },
    resolvedBlockers: function() {
      return Blockers.find({resolved: true});
    }
  });

  Template.create.events({
    "submit .new-blocker": function (event) {
      // This function is called when the new blocker form is submitted
      if (! Meteor.userId()) return false;

      var title = event.target.title.value;
      var desc = event.target.desc.value;
      if (title == "") return false;

      Meteor.call("addBlocker", title, desc);

      window.location.assign("/");

      // prevent default form submit
      return false;
    }
  });

  Template.detail.helpers({
    comments: function() {
      return Comments.find({ blockerId: this._id})
    }
  });

  Template.detail.events({
    "click .resolved": function () {
      Meteor.call("toggleResolved", this._id, this.resolved);
    },
    "submit .new-comment": function (event) {
      var text = event.target.comment.value;
      if (text == "") return false;

      Meteor.call("addComment", this._id, text);
      event.target.comment.value = "";
      // prevent default form submit
      return false;
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addBlocker: function (title, desc) {
    Meteor.call("checkLogin");
    Blockers.insert({
      title: title,
      desc: desc,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      resolved: false,
      createdAt: new Date()
    });
  },
  toggleResolved: function (id, resolved) {
    Meteor.call("checkLogin");
    Blockers.update(id, {$set: {resolved: ! resolved}});
  },
  addComment: function (blockerId, text) {
    Meteor.call("checkLogin");
    Comments.insert({
      blockerId: blockerId,
      text: text,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      createdAt: new Date()
    });
  },
  checkLogin: function () {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
  }
});

Router.route('/', function () {
  this.render('home');
});
Router.route('/create');
Router.route('/detail');
Router.route('/detail/:_id', function () {
  this.render('detail', {
    data: function () {
      return Blockers.findOne({_id: this.params._id});
    }
  });
});