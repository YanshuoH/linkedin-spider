# linkedin-spider

## This project is more a Proof Of Concept than a working tool

## Requirements:
* Selenium (Node Version)
* NodeJS
* MongoDB

## Thoughts
Sometimes, we need some data from a website (eg. a specific genre of profils in LinkedIn). LinkedIn's native search engine is not working so well (only returns the first amount of results and you can only see profils within 2 connections).

And as "some matter of facts", we would/could not use the APIs of the target site:
* quota
* difficule to use
* etc...

So, the question arrives: what should we do?

I would rather say: no search engine is better than Google. So why not use Google for scraping?

## What I've done
I extracted thousands of google results, the query string I use is like:
``` 
product manager site:cn.linkedin.com
```
Which means, I want profils of product manager from LinkedIn in China.

In these results, we have **URL**s, YES!

We have either url of a profil, or url of some sort of list (eg. location where are the 25 top product managers). The next step is to  retrieve the profil urls from the list and begin to scraping real content we interested.
