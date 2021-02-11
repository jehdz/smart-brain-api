const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'jehdz',
        password : '',
        database : 'smart-brain'
    }
});

db.select('*').from('users').then(data => {
    console.log(data);
})

const app = express();

app.use(express.json())
app.use(cors());



app.get('/', (req, res) => {
    res.send("success");
})

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash); //compare the password to the hashed password
            // console.log(isValid); testing purposes
            if(isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        // console.log(user); testing purposes
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get user'))
            } else {
                res.status(400).json('wrong credentials')
            }
        })
        .catch(err => res.status(400).json('Wrong credentials'))
})

app.post('/register', (req, res) => {
    const {email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);
        db.transaction(trx => { // yoou create a transaction when you have to do more than 2 things at once
            trx.insert({ // we use the trx object instead of db to insert into the database
                hash: hash,
                email: email
            })
                .into('login')
                .returning('email')
                .then(loginEmail => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            email: loginEmail[0],
                            name: name,
                            joined: new Date()
                        })
                        .then(user => {
                            res.json(user[0]);
                        })
            })
                .then(trx.commit) // to make sure this data is added, we need to use commit
                .catch(trx.rollback) // rollback is used just in case anything fails. It wont let it go through
        })

        .catch(err => res.status(400).json('unable to register'))
})


app.get('/profile/:id', ((req, res) => {
    const { id } = req.params;
    let found = false;
    db.select('*').from('users').where({id})
        .then(user => {
        if(user.length) {
            res.json(user[0]);
        } else {
            res.status(400).json('Not Found')
        }

    })
        .catch(err => res.status(400).json('Error getting user'))

}))

app.put('/image', ((req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            console.log(entries);
            res.json(entries[0]);
        })
        .catch(err => res.status(400).json('unable to get entries'))

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