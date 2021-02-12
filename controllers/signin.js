const handleSignin = (req, res, db, bcrypt) => {
    const {email, password} = req.body;
    if(!email ||  !password) {
        return res.status(400).json('incorrect form submission') //this works as validation
    }
    db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash); //compare the password to the hashed password
            // console.log(isValid); testing purposes
            if(isValid) {
                return db.select('*').from('users')
                    .where('email', '=', email)
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
}


module.exports = {
    handleSignin: handleSignin
}