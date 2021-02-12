const handleRegister = (req, res, db, bcrypt) => {
    const {email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => { // you create a transaction when you have to do more than 2 things at once
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
}


module.exports = {
    handleRegister: handleRegister
}