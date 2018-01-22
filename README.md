**PianoMan Music Recommendation - Alex Taxiera and Damon Devani**

**ABSTRACT**
	Enjoying music is a universal experience, and doing so with a community even more so. Our project aims at seamlessly providing a stream of related music on a platform widely used in the gaming community. Our music recommendation is based around K-Means Clustering (a form of machine learning) that is trained with existing musical data and subsequently gathers more as users listen and react.

**Design** 
The front-end of the recommendation system is through Discord; as a result, user input is given through a Discord text channel. Our song data will be stored in a DB file, so it will be accessed with SQL queries. We're working with NodeJS to implement this bot. Since there is a live environment a lot of the project will function asynchronously, with the majority of the synchronous work being data accessing and decision making.

Example of the analysis process:
Million Song Dataset → Database (raw) → Clustering Algorithm → Database (+cluster tag) → Discord/User Front End

**Frameworks & Algorithms**
The project is being built on an existing music playing Discord bot, developed by Alex Taxiera. It is written in JavaScript, utilizing NodeJS to run the server app that is essentially the bot’s source of life. It interfaces with the Discord API through the discordie library. In addition, Spotify, YouTube, and SoundCloud all have APIs which we will be accessing for music data and streaming.
An SQL server system will be utilized to host the Million Song Dataset due to the sheer size of it. This will be something like MySQL. Discord itself is an obvious inspiration to the project. It being something that is receiving frequent use from us due to its many integrations with video games. Spotify heavily influenced the idea to expand this system to have some form of a recommendation system because they have an amazing system with their “Discover Weekly” playlists that they dish out to their users, individually, every single week based on the data on those users. 

The following is the layout of our K-Means Clustering algorithm from which we will select music to be recommended:

 function initialize_data
		[input compiled data from dataset to be plotted]
    
 function initialize_clusters
		[initializes [x] number of clusters in random locations]
    
  function get_range
		[determine bounds of data. For example: x > 10, x < 150, y > 5, y < 200]
    
  function assign_values
[assigns all songs/artists as data points to clusters based on nearest cluster by distance, then moves clusters to the average of their songs. Loop through this process several times, solidifying and occasionally creating new clusters based on where the songs land. This will likely be split up into several functions, implementation is not finalized.]
 
 function setup:
		[initialize a grid to plot various songs, then call get_range to determine how big the grid should be. Once the grid is made, call initialize_clusters to have a base to work with. Then call initialize_data, this will place the data that we have collected. Finally, sort by calling assign_values ] 
    
    
Thank you for following our work.
