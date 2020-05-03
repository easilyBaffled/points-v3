# Points Again
---
## ID: string | number
## Tag
	id: 
		Symbol // tag1, recurring, infectious, infectedBy
		| Enum<string, Symbol> // status.done, status.active
	value: 
		undefined // no additional values needed
		&| boolean[]  // streak: [ true, false ], 
		&| ID // infectedBy: 3
		&| ID[]  // infected: [ 5 ] 
## Task
id: ID
name: string
value: number | { infectedId: ID, value: number  }
tags: Tag[]+
created_at: Date

## Bank: number

## Error
id: ID
message: string

## Filter
tags: Tag[]


App Reducer 
	( state, action ) => 
		|> validation
		|> combinedReducers
		|> director

---
## Init World
```js
tasks: [],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
Create the world using each reducer’s initial state

#### Test Format 
```js
imports { status } from '~/tags''

const expected = app();
const actual = {
	tasks: [],
	bank: 0,
	error: [],
	filter: [
		{ tags:  status.active | status.pending }
	]
}
```
---
### Add New Task ( name, value )
```js
tasks: [ 
	{ id: 1, name: 1, value: 1, tags: [ status.active ] }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
A new task is added to tasks
no other changes

#### Test Format 
```js
imports { status } from '~/tags'
import app from '~/app'
import { actions as taskActions } from '~/task'
import { baseAppState } from './testing-util'

const expected = app( baseAppState, taskActions.create( { id: 1, name: 1 } ) );
const actual = {
	tasks: [
		{ id: 1, name: 1, value: 1, tags: [ status.active ] }
	]
}

expect(actual).toEqual(expect.objectContaining(expected))
```
---
### Complete Task ( id )
```js
tasks: [ 
	{ id: 1, name: 1, value: 1, tags: status.pending }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
find task by id
find tasks status tag to pending 

#### Test Format 
```js
imports { status } from '~/tags'
import app from '~/app'
import { actions as taskActions } from '~/task'
import { baseAppState } from './testing-util'

const appState = { 
	...baseAppState,
	tasks: [ 
		{ id: 1, name: 1, value: 1, tags: status.active }
	]
}

const expected = app( appState, taskActions.setPending( { id: 1 } ) );
const actual = {
	tasks: [
		{ id: 1, name: 1, value: 1, tags: [ status.pending ] }
	]
}

expect(actual).toEqual(expect.objectContaining(expected))
```
---
### Spend Points ( 1 )
```js
tasks: [ 
	{ id: 1, name: 1, value: 1, tags: status.pending }
],
bank: 0,
error: [ 
	{ id: e2, message: Insufficient Points }
],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
User tries to spend some points
Spending is in valid because there aren’t enough points in the bank
state is not changed aside from a new error

#### Test Format
```js
imports { status } from '~/tags'
import app from '~/app'
import { actions as bankActions } from '~/bank'
import { baseAppState } from './testing-util'
import { insufficientPoints } '~/errors'

const appState = { 
	...baseAppState,
	tasks: [ 
		{ id: 1, name: 1, value: 1, tags: status.pending }
	]
}

const expected = app( appState, bankActions( 1 ) );
const actual = {
	...appState,
	error: [ 
		{ id: 'e1', ... insufficientPoints }
	]
}

expect(actual).toEqual(expect.objectContaining(expected))
```

---

### Clear Error ( e2 )
```js
tasks: [ 
	{ id: 1, name: 1, value: 1, tags: status.pending }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
user clears the error and proceeds 

#### Test Format
```js
imports { status } from '~/tags'
import app from '~/app'
import { baseAppState } from './testing-util'
import { insufficientPoints, actions as errorActions  } '~/errors'

const appState = { 
	...baseAppState,
	tasks: [ 
		{ id: 1, name: 1, value: 1, tags: status.pending }
	],
	error: [ 
		{ id: 'e1', message: insufficientPoints }
	]
}

const expected = app( appState, errorActions.clearError( 'e1' ) );
const actual = {
	...appState,
	error: []
}

expect(actual).toEqual(expect.objectContaining(expected))
```

---

### Resolve Day
```js
tasks: [ 
	{ id: 1, name: 1, value: 1, tags: status.done }
],
bank: 1,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
End/Start of the day the app resolves all active/pending tasks

#### Test Format
```js
imports { status } from '~/tags'
import app, { actions as appActions } from '~/app'
import { baseAppState } from './testing-util'

const appState = { 
	...baseAppState,
	tasks: [ 
		{ id: 1, name: 1, value: 1, tags: status.pending }
	]
}

const expected = app( appState, appActions.resolveDay() ) );
const actual = {
	tasks: [
		{ id: 1, name: 1, value: 1, tags: [ status.done ] }
	],
	bank: 1
}

expect(actual).toEqual(expect.objectContaining(expected))
```
---
### Spend Points ( 1 )
```js
tasks: [ 
	{ id: 1, name: 1, value: 1, tags: status.done }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
User successfully spends points

#### Test Format
```js
imports { status } from '~/tags'
import app, { actions as appActions } from '~/app'
import { baseAppState } from './testing-util'
import { actions as bankActions } from '~/bank'

const appState = { 
	...baseAppState,
	tasks: [ 
		{ id: 1, name: 1, value: 1, tags: status.done }
	]
}

const expected = app( appState, bankActions( 1 ) );
const actual = {
	bank: 0
}

expect(actual).toEqual(expect.objectContaining(expected))
```

---

### Add New Task ( name: 2, value, tag: tag1 )
```js
tasks: [ 
	{ id: 2, name: 2, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
],
categories: [
	'tag1'
]
```

#### What Happened
Add new task with a custom tag

#### Test Format
```js
imports { status } from '~/tags'
import app, { actions as appActions } from '~/app'
import { baseAppState } from './testing-util'
import { actions as bankActions } from '~/bank'
import { actions as taskActions } from '~/task'

const appState = { 
	...baseAppState,
	tasks: [ 
		{ id: 1, name: 1, value: 1, tags: status.done }
	]
}

const expected = app( appState, taskActions.create( { id: 2, name: 2, tags: [ 'tag1' ] } ) );
const actual = {
	tasks: [ 
		{ id: 2, name: 2, value: 1, tags:  [ status.active, { id: 'tag1' } ] }
	],
	categories: [
		{ id: 'tag1' }
	]
}

expect(actual).toEqual(expect.objectContaining(expected))
```

----

### Add New Task ( name: 3, value, tag: tag1 )
```js
tasks: [ 
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
],
categories: [
	{ id: 'tag1' }
]
```

#### What Happened
Add new task with an existing custom tag

#### Test Format
```js
imports { status } from '~/tags'
import app, { actions as appActions } from '~/app'
import { baseAppState } from './testing-util'
import { actions as bankActions } from '~/bank'
import { actions as taskActions } from '~/task'

const appState = { 
	...baseAppState,
	tasks: [ 
		{ id: 1, name: 1, value: 1, tags: status.done },
		{ id: 2, name: 2, value: 1, tags:  [ status.active, { id: 'tag1' } ] }
	]
}

const expected = app( appState, taskActions.create( { id: 3, name: 3, tags: [ 'tag1' ] } ) );
const actual = {
	tasks: [ 
		{ id: 3, name: 3, value: 1, tags:  [ status.active, { id: 'tag1' } ] }
	],
	categories: [
		{ id: 'tag1' }
	]
}

expect(actual).toEqual(expect.objectContaining(expected))
```

---

### View Tag ( tag1 )
```js
tasks: [ 
	{ id: 3, name: 3, value: 1, tags:  [ status.active, { id: 'tag1' }  ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.active, { id: 'tag1' }  ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ 
		tags:  [ 
			status.active,
			status.pending 
			{ id: 'tag1' }
		]
	}
],
categories: [
	{ id: 'tag1' }
]
```

#### What Happened
An existing tag is added as a filter to better specify the view

`appAction.addFilter( { id: 'tag1' } )`

---
## Reset View 
```js
tasks: [ 
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```


#### What Happened
Filter is reset to show all active or pending tags

`appAction.resetFilters()`

---
## View Completed
### Complete Task ( id: 2 )
```js
tasks: [ 
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.pending, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
Set task id:2 to pending

`taskActions.sendPending( { id: 2 } )`

### View Tag ( status.pending )
```js
tasks: [ 
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.pending, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ tags: status.pending }
]
```

#### What Happened
Set filter to just `status.pending`

`appAction.setFilters( status.pending )`


### View Tag ( history )
```js
tasks: [ 
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.pending, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ tags: status.done }
]
```

#### What Happened
Set filter to just `status.done` to view tasks that have been done in previous days

`appAction.setFilters( status.don e)`

## Reset View 
```js
tasks: [ 
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.pending, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ tags: status.active | status.pending }
]
```

#### What Happened
Filter is reset to show all active or pending tags

`appAction.resetFilters()`

---

## Recurring
### Add New Task ( name: 4, value, attr: recurring )
```js
tasks: [ 
	{ id: 4, name: 4, value: 1, tags:  [ status.active, tag1, recurring ] },
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.pending tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
A new task with the standard recurring tag was added
`taskActions.create( { id: 2, name: 2, tags: [ tags.recurring ] } )`


### Complete Task ( id: 4 )
```js
tasks: [ 
	{ id: 4, name: 4, value: 1, tags:  [ status.pending, tag1, recurring ] },
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.pending, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 0,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
mark the recurring task as pending

`taskActions.setPending( { id } )`

### Resolve Day
```js
tasks: [ 
	{ id: 5, name: 4, value: 1, tags:  [ status.active, tag1, recurring ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 2,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
The day resolves
All pending points are added to the bank
All pending tasks 
	are marked active if recurring
	| are marked done

 `appActions.resolveDay()`

---

## Streak 
### Create Task ( name: 6, attr: streak(5) )
```js
tasks: [ 
	{ id: 6, name: 4, value: 1, tags:  [ status.active, tag1, { tag: streak, streak: [ false, false, false, false, false ] } ] },
	{ id: 5, name: 4, value: 1, tags:  [ status.active, tag1, recurring ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 2,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
A new task with a streak is created
The task’s value is `tags.streak.id` to indicate that the value will be determined by a tag

`taskActions.createStreakTask( { id: 6, name: 6, streakLength: 5 } )`

### Complete Task ( id: 6 )
```js
tasks: [ 
	{ id: 6, name: 4, value: 1, tags:  [ status.pending, tag1, { tag: streak, streak: [ true, false, false, false, false ] } ] },
	{ id: 5, name: 4, value: 1, tags:  [ status.active, tag1, recurring ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 2,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
A task with streak is marked pending
The reducer should know which index in the streak array to set

```js
const i = streak.findIndex( v => !v );
streak[i] = true;
```

`taskActions.setPending( { id } )`

### Resolve Day
```js
tasks: [ 
	{ id: 6, name: 4, value: 1, tags:  [ status.active, tag1, { tag: streak, streak: [ true, false, false, false, false ] } ] },
	{ id: 5, name: 4, value: 1, tags:  [ status.active, tag1, recurring ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 3,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
The Day resolves
The day resolves
All pending points are added to the bank
All pending tasks 
	are marked active if recurring
	| are marked active if `tags.streaks && streak.some( v => !v )`
	| are marked done

Tasks with `tags.status.active && tags.streak`  have their points added to the bank based on the last true value `streak.filter( v => v ).length`

 `appActions.resolveDay()`
---
## Streak Complete
### Complete Task ( id: 6 )
```js
tasks: [ 
	{ id: 6, name: 4, value: 1, tags:  [ status.pending, tag1, { tag: streak, streak: [ true, true, true, true, true ] } ] },
	{ id: 5, name: 4, value: 1, tags:  [ status.active, tag1, recurring ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 2,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
A task with streak is marked pending
The reducer should know which index in the streak array to set

`taskActions.setPending( { id } )`

### Resolve Day
```js
tasks: [ 
	{ id: 6, name: 4, value: 1, tags:  [ status.done, tag1, { tag: streak, streak: [ true, true, true, true, true ] } ] },
	{ id: 5, name: 4, value: 1, tags:  [ status.active, tag1, recurring ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 1, tags:  [ status.active, tag1 ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 8,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
The Day resolves
The day resolves
All pending points are added to the bank
All pending tasks 
	are marked active if recurring
	| are marked active if `tags.streaks && streak.some( v => !v )`
	| are marked done

Tasks with `tags.status.active && tags.streak`  have their points added to the bank based on the last true value `streak.filter( v => v ).length`

 `appActions.resolveDay()`

## Infection
### Resolve Day
```js
tasks: [ 
	{ id: 6, name: 4, value: 1, tags:  [ status.done, tag1, { tag: streak, streak: [ true, true, true, true, true ] } ] },
	{ id: 5, name: 4, value: 1, tags:  [ status.active, tag1, recurring ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 1, created_at: Date, tags:  [ status.active, tag1, infectious ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 8,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
When the day resolves old tasks become infectious

The Day resolves
The day resolves
All pending points are added to the bank
All pending tasks 
	are marked active if recurring
	| are marked active if `tags.streaks && streak.some( v => !v )`
	| are marked done
All old tasks(`Date.now() - created_at > 5` ) 

### Resolve Day
```js
tasks: [ 
	{ id: 6, name: 4, value: 1, tags:  [ status.done, tag1, { tag: streak, streak: [ true, true, true, true, true ] } ] },
	{ id: 5, name: 4, value: {id:3, value: 1}, tags:  [ status.active, tag1, recurring, infectedBy:3 ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 3, created_at: Date, tags:  [ status.active, tag1, { tag: infectious, infected: [ 5 ] ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 8,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
When the day resolves infectious task infect uninfected tasks

The Day resolves
The day resolves
All pending points are added to the bank
All pending tasks 
	are marked active if recurring
	| are marked active if `tags.streaks && streak.some( v => !v )`
	| are marked done
For all infectious task find one active task, add an infected tag to it, with the infectious’s task’s id 
All old tasks(`Date.now() - created_at > 5` ) 

### Complete Task ( id: 5 )
```js
tasks: [ 
	{ id: 6, name: 4, value: 1, tags:  [ status.done, tag1, { tag: streak, streak: [ true, true, true, true, true ] } ] },
	{ id: 5, name: 4, value: {id:3, value: 1}, tags:  [ status.pending, tag1, recurring, infectedBy:3 ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 3, created_at: Date, tags:  [ status.active, tag1, infectious ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 8,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
Infected task is marked as complete

### Resolve Day
```js
tasks: [ 
	{ id: 6, name: 4, value: 1, tags:  [ status.done, tag1, { tag: streak, streak: [ true, true, true, true, true ] } ] },
	{ id: 5, name: 4, value: 1, tags:  [ status.active, tag1, recurring ] },
	{ id: 4, name: 4, value: 1, tags:  [ status.done, tag1, recurring ] },
	{ id: 3, name: 3, value: 4, created_at: Date, tags:  [ status.active, tag1, infectious ] },
	{ id: 2, name: 2, value: 1, tags:  [ status.done, tag1 ] },
	{ id: 1, name: 1, value: 1, tags:  [ status.done ] }
],
bank: 8,
error: [],
filter: [
	{ tags:  status.active | status.pending }
]
```

#### What Happened
When the day resolves the infected task’s are added to the original infectious task

The Day resolves
The day resolves
All pending points are added 
	to the the infecteedBy task
	| to the bank
All pending tasks 
	are marked active if recurring
	| are marked active if `tags.streaks && streak.some( v => !v )`
	| are marked done
For all infectious task find one active task, add an infected tag to it, with the infectious’s task’s id 
All old tasks(`Date.now() - created_at > 5` ) 

----

