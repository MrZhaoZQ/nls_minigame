'use strict';

module.exports = {
  "id": 2,
  "name": "新手 2",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green"
  ],
  "slotCount": 5,
  "gridSize": 10,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Single",
      "position": [
        0.03965392807731405,
        0,
        -0.016956466413103055
      ],
      "rotation": [
        0,
        90,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b2"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue"
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Gear",
      "position": [
        -2.2749282388016585,
        1,
        -0.2943764369003474
      ],
      "rotation": [
        0,
        40,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "blue"
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_L",
      "position": [
        2.1485931182745848,
        1,
        -0.22298858605790883
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -0.9,
            0,
            -1.1
          ],
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            -1.5,
            0,
            -1.1
          ],
          "color": "blue"
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "red"
        }
      ]
    }
  ],
  "seed": 2000005
};
