const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();

app.use(express.json())
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            password: 'cookies',
            email: 'john@gmail.com',
            entries: 0,
            joined: new Date()

        },
        {
            id: '124',
            name: 'Sally',
            password: 'bananas',
            email: 'sally@gmail.com',
            entries: 0,
            joined: new Date()

        }
    ],
    login: [
        {
            id: '987',
            hash: '', //w
            email: 'john@gmail.com'
        }
    ]
}

app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/signin', (req, res) => {

    if(req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json('error logging in');
    }
})

app.post('/register', (req, res) => {
    const {email, name, password} = req.body;
    database.users.push({
        id: '125',
        name: name,
        email: email,
        entries: 0,
        joined: new Date()
    })
    res.json(database.users[database.users.length - 1]);
})


app.get('/profile/:id', ((req, res) => {
    const { id } = req.params;
    let found = false;
    database.users.forEach(users => {
        if (users.id === id) {
            found = true;
           return res.json(users);
        }
    })
    if (!found) {
        res.status(404).json("no user found")
    }
}))

app.put('/image', ((req, res) => {
    const { id } = req.body;
    let found = false;
    database.users.forEach(users => {
        if (users.id === id) {
            found = true;
            users.entries++
            return res.json(users.entries);
        }
        if (!found) {
            res.status(404).json("no user found")
        }
    })
}))

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });



app.listen(3000, () => {
    console.log('App is running on port 3000')
})

/*


/ --> res responds with this is working

/signin --> POST request. Going to respond w success or fail
/register --> POST respond with user
/profile/:userId --> GET respond with user
/image --> PUT respond with updated user update (count of some sort)

 */