# url-sh
Express / mongoDb URL shortener microservice

## Demo
https://tsurl.herokuapp.com/

## How to use
Create a new shortened url : to https://github.com/tsauvajon/, for exemple

https://tsurl.herokuapp.com/new/https://github.com/tsauvajon/

returns: ```{"url":"https://github.com/tsauvajon/","shortened":"tsurl.herokuapp.com/S1-twjqpg"}```

Access the newly created URL:

https://tsurl.herokuapp.com/S1-twjqpg
