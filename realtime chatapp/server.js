require('dotenv').config();


app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);


// store mapping between userId and socketId(s)
const onlineUsers = new Map(); // userId -> Set(socketId)


io.on('connection', (socket) => {
    console.log('socket connected', socket.id);


    socket.on('user:online', async ({ userId }) => {
        if (!userId) return;
        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId).add(socket.id);
        socket.data.userId = userId;


// mark user online in DB (optional)
        try { await User.findByIdAndUpdate(userId, { online: true }); } catch(e){}


// emit updated online list
        io.emit('users:online', Array.from(onlineUsers.keys()));
    });


    socket.on('join:conversation', ({ conversationId }) => {
        if (conversationId) socket.join(conversationId);
    });


    socket.on('private:typing', ({ conversationId, fromUserId, toUserId, typing }) => {
// send typing event to other participant(s)
// notify to sockets belonging to toUserId
        const sockets = onlineUsers.get(toUserId) || new Set();
        sockets.forEach(sid => io.to(sid).emit('private:typing', { conversationId, fromUserId, typing }));
    });


    socket.on('private:message', async ({ conversationId, fromUserId, toUserId, text }) => {
        try {
// persist message
            const msg = await Message.create({ conversation: conversationId, sender: fromUserId, text });


// emit to conversation room
            io.to(conversationId).emit('private:message', msg);


// also deliver to specific recipient sockets if they are online
            const sockets = onlineUsers.get(toUserId) || new Set();
            sockets.forEach(sid => io.to(sid).emit('private:message', msg));


        } catch (err) {
            console.error('message error', err);
        }
    });


    socket.on('disconnect', async () => {
        const userId = socket.data.userId;
        if (userId && onlineUsers.has(userId)) {
            const s = onlineUsers.get(userId);
            s.delete(socket.id);
            if (s.size === 0) {
                onlineUsers.delete(userId);
// set offline
                try { await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() }); } catch(e){}
            }
        }
        io.emit('users:online', Array.from(onlineUsers.keys()));
        console.log('socket disconnected', socket.id);
    });
});


const PORT = process.env.PORT || 5000;


connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect DB', err);
});