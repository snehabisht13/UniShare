
const QueryRoom = require("../models/Query");
const Senior = require("../models/Senior");

module.exports.getQueryPage = async (req, res) => {
    try {
        const seniorId = req.params.id;
        
        let room = await QueryRoom.findOne({senior: seniorId}).populate({
            path: 'queries.askedBy queries.replies.repliedBy senior'
        });

        if(!room) {
            room = await QueryRoom.create({senior: seniorId, queries:[]});
        }
        res.render("chatSenior", {room, currUser: req.session.user});
    }
    catch (err) {
        console.log(err);
        res.status(400).send("Internel error");
    }
};


module.exports.postQuery =  async(req, res) => {
    try {
        const juniorId = req.session.user.id;
        const seniorId = req.params.id;
        const {question} = req.body;

        let room;
        room = await QueryRoom.findOne({senior: seniorId});
        if(!room){
            await QueryRoom.create({senior: seniorId, queries: []});
        }

        room.queries.push({
            askedBy: juniorId,
            question: question,
            replies: []
        });
        await room.save();
        res.redirect(`/chat/senior/${seniorId}`);
    }
    catch (err) {
        console.log(err);
        res.status(400).send("Internel error");
    }
}

module.exports.postReply = async (req, res) => {
    try {
        const {reply} = req.body;
        const { id } = req.params;
        const seniorId = req.session.user.id;

        const room = await QueryRoom.findOne({senior: seniorId});
        if(!room){
            return res.status(404).send("Not found");
        }

        const query = room.queries.id(id);
        if(!query){
            return res.status(404).send("Query not found");
        }

        query.replies.push({
            repliedBy: seniorId,
            reply: reply,   
        });

        await room.save();
        res.redirect(`/chat/senior/${seniorId}`);

    }
    catch (err) {
        console.log(err);
        res.status(400).send("Internel error");
    }
};

