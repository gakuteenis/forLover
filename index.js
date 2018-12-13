const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const Datastore = require('nedb');
const users = new Datastore({
    filename: './users.db',
    autoload: true
});
const posts = new Datastore({
    filename: './posts.db',
    autoload: true
});
const achivement = new Datastore({
    filename: './achivement.db',
    autoload: true
});
const reaction = new Datastore({
    filename: './reaction.db',
    autoload: true
});



const router = express.Router();



router.route("/users")
	.post((req, res, next) => {
		const userName = req.body.userName;
		const userNameIsUnique = false;
		if (userNameIsUnique) {
			users.insert({
				'userName': userName,
			}, (error, doc) => {
				if (error) next(error);
				else res.json(doc);
			});
		} else {
			next("user name already used")
		}
	})


	router.get("/users/:id", (req, res, next) => {
		const id = req.params.id;
		user.find({
			_id : id,
		},(error, docs) => {
			if (error) {
					next(error);
			} else {
					res.json(docs);
			}
		});
	});


router.route("/posts")
	.get((req, res, next) => {
		posts.find({
			//全投稿を取得
		}, (error, docs) => {
			if (error) {
					next(error);
			} else {
					res.json(docs);
			}
		});
	})

	.post((req, res, next) => {
		const UserId = req.body.UserId;
		const content = req.body.content;
		users.find({ //存在しないユーザーの投稿を防ぐ
			_id : UserId,
		},(error, docs) => {
			if (error) {
					next(error);
			} else {
					if (docs.length > 0){
						posts.insert({
							UserId : UserId,
							content : content,
							shares : false,
						}, (error, doc) => {
							res.json(doc);
						});
					}else {
						next("userNotFound")
					}
			}
		});
	})

	.put((req, res, next) => {
		const contentId = req.body.contentId;
		const UserId = req.body.UserId;
		const conetnt = req.body.content;
		const new_content = req.body.new_content;
		posts.update({
			_id : contentId,
			UserId : UserId,
		}, {
					$set: {
							content : new_content,
					}
		}, {
				multi: false,
		}, (error, doc) => {
			res.json(doc);
		});
	})

router.route("/posts/:id")
   .get((req, res, next) => {
		 const contentId = req.params.id;
		 posts.find({
			 _id: contentId,
		 }, (error, docs) => {
			 reaction.find({
				 postId : contentId,
			 }, (error, reactions) => {
				 res.json(Object.assign({}, docs[0], {reactions}));
			 });
		 });
	 })


router.route("/achivement")
  .post((req, res, next) => {
		const postId = req.body.postId;
		const achivements = req.body.achivement;
		posts.find({
			_id : postId,
		},(error, docs) => {
			if (error) {
				next(error);
			} else {
				if (docs.length > 0){
					achivement.insert({
						psotId : postId,
						created_at : Date.now(),
						achivement : achivements,
					}, (error, doc) => {
						res.json(doc);
					});
				}else {
					next("contentNotFound")
				}
			}
		});
	})




	router.route("/reaction")
	  .post((req, res, next) => {
			const UserId = req.body.UserId;
			const postId = req.body.postId;
			const reactions = req.body.reactions;
			posts.find({
				_id : postId,
			}, (error, docs) => {
				if (error) {
					next(error);
				} else {
					if (docs.length > 0) {
						if (docs[0].UserId !== UserId) {
							reaction.insert({
								UserId : UserId,
								postId : postId,
								reactions : reactions,
							}, (error, doc) => {
								res.json(doc);
							});
						} else {
							next("sameUser")
						}
					} else {
						next("notReaction")
					}
				}
			});
		});






app.use(router);
app.use((error, req, res, next) => {
		console.error(error);
		res.json(error, 500);
});

app.listen(3000, () => {
	console.log(`server is running: localhost:3000`);
});
