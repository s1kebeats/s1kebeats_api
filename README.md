<h2>s1kebeats API</h2>

`/api`

- `/register`

  **body**: {

  - **email**: email string;
  - **username**: numbers and letters only string;
  - **password**: string, 8 chars min, at least one digit, at least one upper case letter

  }

- `/login`

  **body**: {

  - **username**: string;
  - **password**: string;
  - **refresh**: boolean; (controls refresh token cookie)

  }

- `/edit`

  **auth**: true;

  **body**: {

  - **username**?: numbers and letters only string;
  - **displayedName**?: string;
  - **about**?: string;
  - **youtube**?: string;
  - **vk**?: string;
  - **instagram**?: string;
  - **image**?: 'image/' containing string;

  }

- `/logout`

  **auth**: true;

  **cookies**: {

  - **refreshToken**: string; (http-only)

  }

- `/activate/:activationLink`

  **params**: {

  - **activationLink**: string;

  }

- `/refresh`

  **auth**: true;

  **cookies**: {

  - **refreshToken**: string; (http-only)

  }

- `/checkusername/:username`

  **params**: {

  - **username**: numbers and letters only string;

  }

- `/author`

  - `/`

    **query**: {

    - **viewed**?: number

    - **q**?: string (filters if author username / displayedName contains parameter)

    }

  - `/:username`

    **params**: {

    - **username**: string;

    }

- `/beat`

  - `/upload`

    **auth**: true;

    **body**: {

    - **name**: string;
    - **wavePrice**: decimal string;
    - **wave**: string containing "wave/";
    - **mp3**: string containing "mp3/";
    - **stemsPrice**?: string containing "stems/", required if stems provided;
    - **stems**?: string containing "stems/", required if stemsPrice provided;
    - **image**?: string containing "image/";
    - **bpm**?: decimal string;
    - **description**?: string, 255 chars max;
    - **tags**?: string, comma-separated tag names;

    }

  - `/`

    **query**: {

    - **viewed**?: number;
    - **q**?: string (filters if beat name / author username / author displayedName contains parameter);
    - **bpm**?: number;
    - **tags**?: string, containing **"Lower"** or **"Higher"**;

    }

  - `/:id`

    **auth**: optional (only authorized can access beat comments);

    **params**: {

    - `id`: number;

    }

  - `/:id/comment`

    **auth**: true;

    **params**: {

    - `id`: number;

    }

    **body**: {

    - `content`: string, 255 chars max;

    }

  - `/:id/like`

    **auth**: true;

    **params**: {

    - `id`: number;

    }

  - `/:id/delete`

    **auth**: true;

    **params**: {

    - `id`: number;

    }

  - `/:id/edit`

    **auth**: true;

    **params**: {

    - `id`: number;

    }

    **body**: {

    - **name**?: string;
    - **wavePrice**?: decimal string;
    - **wave**?: string containing "wave/";
    - **mp3**?: string containing "mp3/";
    - **stemsPrice**?: string containing "stems/", required if stems provided;
    - **stems**?: string containing "stems/", required if stemsPrice provided;
    - **image**?: string containing "image/";
    - **bpm**?: decimal string;
    - **description**?: string, 255 chars max;

    }

- `/media`

  - `/upload`

    **auth**: true;

    **body**: {

    - **path**: 'image' | 'mp3' | 'wave' | 'stems'

    }

    **files**: [

    - **path** == 'image': {

      - **extensions**: [".png", ".jpg", ".jpeg"]

      }

    - **path** == 'mp3': {

      - **extension**: ".mp3"
      - **max filesize**: 150mb

      }

    - **path** == 'wave': {

      - **extension**: ".wav"
      - **max filesize**: 300mb

      }

    - **path** == 'stems': {

      - **extensions**: [".zip", ".rar"]
      - **max filesize**: 500mb

      }

    ]

  - `/:path/:file`

    **params**: {

    - **path**: string;
    - **file**: string;

    }

- `comment`

  - `/:id`

    **params**: {

    - **id**: number;

    }

    **query**: {

    - **viewed**?: number

    }

  - `/delete:id`

    **params**: {

    - **id**: number;

    }

- `/tag`

  - `/`

    **query**: {

    - **viewed**?: number

    }
