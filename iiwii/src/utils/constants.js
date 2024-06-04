export const setup = [
    {
        type: 'h1',
        id: '9e7bc2a7-885d-46aa-9a1e-c1673a25ed28',
        content: [
            {
                content: 'welcome to iiwii (it is what it is)',
                id: 'fed2882d-d1b0-43ef-8c1d-861e6ee278bf',
                style: {
                    'bold': true, 
                    'italics': false,
                    'underline': false,
                    'code': false,
                    'strikethrough': false,
                    'color': '#000000'
                }
            }
        ]
    },
    {
        type: 'h2',
        id: '6c923ecb-302a-4778-b4fd-b5112e8bbc26',
        content: [
            {
                content: 'This is a Header 2',
                id: 'c976fc36-b110-4e53-8988-eebbe8990a33',
                style: {
                    'bold': false, 
                    'italics': false,
                    'underline': false,
                    'code': false,
                    'strikethrough': false,
                    'color': '#000000'
                }
            }
        ]
    },
    {
        type: 'text',
        id: '5bb9b175-ae25-4999-be06-575391d732ef',
        content: [
            {
                content: 'And this is a Header 3',
                id: '5520d83e-0b96-423a-a90b-1ecbaffb9714',
                style: {
                    'bold': false, 
                    'italics': false,
                    'underline': true,
                    'code': false,
                    'strikethrough': true,
                    'color': '#000000'
                }
            }
        ]
    },
    {
        type: 'text',
        id: 'c32d8b45-92fe-44f6-8b61-42c2107dfe87',
        content: [
            {
                content: 'this is text ',
                id: 'fd80b3fc-1c73-4433-979d-d6c140727467',
                style: {
                    'bold': false, 
                    'italics': false,
                    'underline': false,
                    'code': false,
                    'strikethrough': false,
                    'color': '#000000'
                }
            },
            {
                content: 'that could be formatted differently',
                id: '8beb2661-d206-4404-aefb-0cb9b63d46d8',
                style: {
                    'bold': true, 
                    'italics': true,
                    'underline': true,
                    'code': false,
                    'strikethrough': false,
                    'color': '#5f7546'
                }
            },
        ]
    },
    {
        type: "ordered",
        start: 3,
        id: 'a10f7afb-bda3-4395-8da4-121a24e4677e',
        content: [
            {
                type: 'text',
                id: 'e6282c33-7f49-482a-b13b-8cf00ca0f72b',
                content: [
                    {
                        content: 'this is part of an ',
                        id: '243467ba-f261-46ab-ae91-17c456cea4d2',
                        style: {
                            'bold': false, 
                            'italics': false,
                            'underline': false,
                            'code': false,
                            'strikethrough': false,
                            'color': '#000000'
                        }
                    },
                    {
                        content: 'ordered list',
                        id: '928ebfe9-7fa1-4bf2-b561-1ba7eef215ad',
                        style: {
                            'bold': false, 
                            'italics': false,
                            'underline': true,
                            'code': false,
                            'strikethrough': false,
                            'color': '#8c709c'
                        }
                    }
                ]
            },
            {
                type: 'text',
                id: 'e33be222-ef93-4b4f-a9b8-42935a497e5f',
                content: [
                    {
                        content: 'this part looks like code',
                        id: 'f564af9e-8c8a-4f24-a615-cc552991562f',
                        style: {
                            'bold': true, 
                            'italics': true,
                            'underline': true,
                            'code': true,
                            'strikethrough': false,
                            'color': '#000000'
                        }
                    }
                ]
            },
            {
                type: 'text',
                id: 'a121db05-dcaa-4955-a690-3b75afbb753f',
                content: [
                    {
                        content: 'a',
                        id: '5ed0ac2c-7fe2-4c2e-a3d4-e6d9034d3069',
                        style: {
                            'bold': false, 
                            'italics': false,
                            'underline': false,
                            'code': false,
                            'strikethrough': false,
                            'color': '#000000'
                        }
                    }
                ]
            },
        ]
    } 
]

export const PARAGRAPH = {
    type: 'h1',
    id: '9e7bc2a7-885d-46aa-9a1e-c1673a25ed28',
    content: [
        {
            content: 'welcome to iiwii (it is what it is)',
            id: 'fed2882d-d1b0-43ef-8c1d-861e6ee278bf',
            style: {
                'bold': true, 
                'italics': false,
                'underline': false,
                'code': false,
                'strikethrough': false,
                'color': '#000000'
            }
        }
    ]
}

export const NODE = {
    content: 'welcome to iiwii (it is what it is)',
    id: 'fed2882d-d1b0-43ef-8c1d-861e6ee278bf',
    style: {
        'bold': true, 
        'italics': false,
        'underline': false,
        'code': false,
        'strikethrough': false,
        'color': '#000000'
    }
}

export const FONTSIZE = {
    'text': 16,
    'h1': 28,
    'h2': 24,
    'h3': 20
}

export const MENU = [
    {
        'name': 'elements',
        'displayText': "Elements",
        'class': 'fa-solid fa-trash-can fa-ms fa-fw',
        'items': [{
            'name': 'h1', 
            'displayText': 'Heading 1', 
            'class': 'fa-solid fa-1 fa-xs fa-fw', 
        }, {
            'name': 'h2', 
            'displayText': 'Heading 2', 
            'class': 'fa-solid fa-2 fa-xs fa-fw'
        }, {
            'name': 'h3', 
            'displayText': 'Heading 3', 
            'class': 'fa-solid fa-3 fa-xs fa-fw'
        }, {
            'name': 'text', 
            'displayText': 'Heading 3', 
            'class': 'fa-solid fa-font fa-xs fa-fw'
        }, {
            'name': 'ul', 
            'displayText': 'Bullet list', 
            'class': 'fa-solid fa-list-ul fa-xs fa-fw'
        }, {
            'name': 'ol', 
            'displayText': 'Number list', 
            'class': 'fa-solid fa-list-ol fa-xs fa-fw'
        }
        ]
    }, 
]

export const TOOL = [
    {
        'name': 'transform',
        'displayText': "Turn into",
        'class': 'fa-solid fa-arrow-right-arrow-left fa-xs fa-fw'
    },
    {
        'name': 'color',
        'displayText': "Colour",
        'class': 'fa-solid fa-arrow-right-arrow-left fa-xs fa-fw'
    },
    {
        'name': 'elements',
        'displayText': "Elements",
        'class': 'fa-solid fa-trash-can fa-xs fa-fw',
        'items': [{
            'name': 'bold', 
            'displayText': 'Bold', 
            'class': 'fa-solid fa-bold fa-xs fa-fw', 
        }, {
            'name': 'italics', 
            'displayText': 'Italics', 
            'class': 'fa-solid fa-italic fa-xs fa-fw'
        }, {
            'name': 'underline', 
            'displayText': 'Underline', 
            'class': 'fa-solid fa-underline fa-xs fa-fw'
        }, {
            'name': 'strikethrough', 
            'displayText': 'Strikethrough', 
            'class': 'fa-solid fa-strikethrough fa-xs fa-fw'
        }, {
            'name': 'code', 
            'displayText': 'Code', 
            'class': 'fa-solid fa-code fa-xs fa-fw'
        }
        ]
    }, 
]
