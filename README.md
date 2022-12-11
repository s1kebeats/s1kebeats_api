# s1kebeats API
### 
**User**
- /api/register - User registration

**Body fields:**
**username**: string, unique
**email**: string
**password**: string, contains at least one capital letter, at least one digit, at least 8 chars long

- /api/login- User login, **Needs activated email**

**Body fields:**
**username**: string
**password**: string

- /api/activate/`:ActivationLink` - User's account activation
- /api/edit - User's data editing

**Form-data fields:**

**Optional:**
**displayedName**: string
**about**: string
**youtube**: string; username
**vk**: string; username
**instagram**: string; username
**image**: .png/.jpeg/.jpg image

- /api/logout - User logout
- /api/refresh - Refresh user's token
### 
**Author**
- /api/author/ - Authors search

**Query fields:**
**q**:  string; author's username or author's displayedName
**viewed**: decimal string, number of authors to skip on the next request (for infinite scroll)

- /api/author/`:username` - Individual author data
### 
**Beat**

- /api/beat/upload - Beat upload

**Form-data fields:**

**Required**: 
**name**: string
**wavePrice**: decimal string
**wave**: .wav audio file
**mp3**: .mp3 audio file

**Optional:**
**bpm**: decimal string
**stemsPrice**: decimal string
**stems**: .rar/.zip archive
**description**: string
**image**: .png/.jpeg/.jpg image

- /api/beat/`:id`/edit - Beat editing

**Form-data fields:**

**Optional:**
**bpm**: decimal string
**stemsPrice**: decimal string
**stems**: .rar/.zip archive
**description**: string
**image**: .png/.jpeg/.jpg image
**name**: string
**wavePrice**: decimal string
**wave**: .wav audio file
**mp3**: .mp3 audio file

- /api/beat/- Beats search

**Query fields:**
**bpm**: decimal string
**tags**: string of  tag ids, separated by commas
**q**: string, includes beat name, beat author username, beat author displayedName
**order**: string, **syntax: H/L+beat field**, H for highest first, L for lowest first, example: order=HwavePrice (beats with highest wavePrice first)
**viewed**: decimal string, number of beats to skip on the next request (for infinite scroll)

- /api/beat/`:id` - Individual beat data
- /api/beat/`:id`/comment - Comment beat with given id

**Body fields:**
**content**: string

- /api/beat/`:id`/like- Toggle like on a beat with given id
- /api/beat/`:id`/delete- Delete beat with given id
### 
**File**
- /api/file/`:path`/`:key` -  Get media file from the server
### 
**Comment**
- /api/comment/`:id` -  Get comments to beat with given id

**Query fields:**
**viewed**: decimal string, number of comments to skip on the next request (for infinite scroll)

- /api/comment/delete/`:id` -  Delete comment with given id
### 
**Tag**
- /api/tag/ -  Tags search

**Query fields:**
**viewed**: decimal string, number of tags to skip on the next request (for infinite scroll)
**name**: string, 
