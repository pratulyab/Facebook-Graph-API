# Facebook Graph API

1) Facebook Photos
- View the photos uploaded by you on Facebook.
- The retrieved photos are displayed in carousel provided by Materialize CSS.
- An access token for your account is required, which can generated with the help of Facebook's Graph API tool.

 ![The page layout.]
 (/screenshots/fbphotos.png)

#### Visit the 'FACEBOOK GRAPH API TOOL' link and follow the steps written in green to generate an access token. Make sure to have the correct permissions selected.



2) Facebook Group Feed
- View the posts of a Facebook group you are a member of.
- All your groups are displayed in an accordion provided by Materialize.
- The links from the posts are extracted and displayed separately.
- Filters: Uploader, Date on and after which the posts are to be retrieved.

![Group Feed]
(/screenshots/fbgroup1.png)
### - The access token needs to be entered to get all the groups.

![All the groups rendered and displayed in accordion]
(/screenshots/fbgroup2.png)
### - All the groups are retrieved and displayed in an accordion.

![Date filter using pickadate plugin]
(/screenshots/fbgroup3.png)
### - Date can be chosen. The posts with lesser creation date wouldn't be displayed.
	- Plugin: pickadate

![Retrieved feed]
(/screenshots/fbgroup4.png)
### - The group feed is retrieved and displayed in cards.
