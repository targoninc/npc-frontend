import express from 'express';

const app = express();

app.use(express.static('dist'));

app.use('/images', express.static('ui/images'));
app.use('/fonts', express.static('ui/fonts'));

app.listen(3000, function () {
    console.log('http://localhost:3000/');
});