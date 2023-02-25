[![npm](https://img.shields.io/npm/v/@themost%2Fclient.svg)](https://www.npmjs.com/package/@themost%2Fclient)
![GitHub top language](https://img.shields.io/github/languages/top/themost-framework/client)
[![License](https://img.shields.io/npm/l/@themost/client)](https://github.com/themost-framework/themost-client/blob/master/LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/themost-framework/client)
![GitHub Release Date](https://img.shields.io/github/release-date/themost-framework/client)
[![npm](https://img.shields.io/npm/dw/@themost/client)](https://www.npmjs.com/package/@themost%2Fclient)
[![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@themost/client)](https://snyk.io/vuln/npm:%40themost%2Fclient)

# @themost/client

![MOST Web Framework Logo](https://github.com/themost-framework/common/raw/master/docs/img/themost_framework_v3_128.png)

[@themost-framework](https://github.com/themost-framework) core module for javascript clients.

`@themost/client` provides a set of methods for creating [OData v4](https://www.odata.org/documentation/) queries by using javascript closures in both client and server.

e.g. get name and price of products with category equals to 'Laptops'

    // GET /Products?$select=name,price&$filter=category eq 'Laptops'
    
    const items = await context.model('Products').select(({name, price}) => {
        return {
            name,
            price
        }
    }).where(({category}) => {
        return category === 'Laptops'
    }).getItems();

Javascript closure prototypes introduced by [@themost/query](https://github.com/themost-framework/query) uses native language and produces equivalent query expressions for both client and server environments:

    import { round } from '@themost/query';

    context.model('Products').select((x) => {
        return {
            name: x.name,
            releaseYear: x.releaseDate.getFullYear(),
            price: round(x.price, 2)
        }
    }).where((x) => {
        return x.category === 'Laptops';
    })
    ...

which produces the following OData expression `/Products?$select=name,year(releaseDate) as releaseYear,round(price,2) as price&$filter=category eq 'Laptops'`

or an equivalent SQL statement for server-side enviroments `SELECT Products.name AS name, YEAR(Products.releaseDate) AS releaseYear, ROUND(Products.price,2) AS price FROM Products WHERE Products.category = 'Laptops'`


## node.js client

![@themost/node](docs/nodejs.png)

[@themost/node](https://github.com/themost-framework/node) is a client module for node.js applications which are going to use [@themost-framework](https://github.com/themost-framework) as backend api server.

## angular client

![@themost/angular](docs/angular.png)

[@themost/angular](https://github.com/themost-framework/angular) is a client module for angular 2.x+ applications which are going to use [@themost-framework](https://github.com/themost-framework) as backend api server.

## react client

![@themost/react](docs/react.png)

[@themost/react](https://github.com/themost-framework/react) is a client module for react applications which are going to use [@themost-framework](https://github.com/themost-framework) as backend api server.

## jQuery client

![@themost/jquery](docs/jquery.png)

[@themost/jquery](https://github.com/themost-framework/jquery) is a client module for JQuery scripts and applications which are going to use [@themost-framework](https://github.com/themost-framework) as backend api server.

## Usage

use `ClientDataContext` which is being provided by your environment and initialize an instance of `ClientDataQueryable` class.

### select(expr: QueryFunc<T>, params?: any)

Define `$select` system query option by using a javascript closure:

    const items = await context.model('Orders')
        .asQueryable()
        .select((x) => {
            return {
                id: x.id,
                customer: x.customer.description,
                orderDate: x.orderDate,
                product: x.orderedItem.name
            }
        })
        .where((x) => {
            return x.paymentMethod.alternateName === 'DirectDebit';
        }).orderByDescending((x) => x.orderDate)
        .take(10)
        .getItems();

> `/Orders?$select=id,customer/description as customer,orderDate,orderedItem/name as product&$filter=paymentMethod/alternateName eq 'DirectDebit'&$orderby=orderDate desc&$top=10`

### where(expr: QueryFunc<T>, params?: any)

Define `$filter` system query option by using a javascript closure:

    const items = await context.model('Orders')
        .asQueryable()
        .where((x, orderStatus) => {
            return x.orderStatus.alternateName === orderStatus;
        }, {
            orderStatus: 'OrderPickup'
        }).take(10)
        .getItems();

> `/Orders?$filter=orderStatus/alternateName eq 'OrderPickup'&$top=10`

### take(n: number)

Set `$top` system query option for defining the number of records to be taken

    const items = await context.model('Orders')
        .asQueryable()
        .where((x, orderStatus) => {
            return x.orderStatus.alternateName === orderStatus;
        }, {
            orderStatus: 'OrderPickup'
        }).take(10)
        .getItems();

> `/Orders?$filter=orderStatus/alternateName eq 'OrderPickup'&$top=10`

### skip(n: number)

Set `$skip` system query option for defining the number of records to be skipped

    const items = await context.model('Orders')
        .asQueryable()
        .where((x, orderStatus) => {
            return x.orderStatus.alternateName === orderStatus;
        }, {
            orderStatus: 'OrderPickup'
        }).take(25)
        .skip(25)
        .getItems();

> `/Orders?$filter=orderStatus/alternateName eq 'OrderPickup'&$top=25&$skip=25`

### orderBy(expr: QueryFunc<T>, params?: any)

Define `$orderby` system query option for sorting records

    const items = await context.model('People')
        .asQueryable()
        .orderBy(({familyName}) => familyName)
        .getItems();

> `/People?$orderby=familyName`

### thenBy(expr: QueryFunc<T>, params?: any)

    const items = await context.model('People')
        .asQueryable()
        .orderBy(({familyName}) => familyName)
        .thenBy(({givenName}) => givenName)
        .getItems();

> `/People?$orderby=familyName,givenName`

### orderByDescending(expr: QueryFunc<T>, params?: any)

    const items = await context.model('People')
        .asQueryable()
        .orderByDescending(({familyName}) => familyName)
        .getItems();

> `/People?$orderby=familyName desc`

### thenByDescending(expr: QueryFunc<T>, params?: any)

    const items = await context.model('People')
        .asQueryable()
        .orderByDescending(({familyName}) => familyName)
        .thenByDescending(({givenName}) => givenName)
        .getItems();

> `/People?$orderby=familyName desc,givenName desc`


### groupBy<T>(...arg: [QueryFunc<T>], params?: any)

Define `$groupby` system query option to group records by using javascript closures:

    const results = await context.model('Orders')
        .asQueryable()
        .select(({id, orderStatus}) => {
            return {
                total: count(id),
                orderStatus
            }
        }).groupBy(({orderStatus}) => orderStatus)
        .getItems();

> `/Orders?$select=count(id) as total,orderStatus&$groupby=orderStatus`

### expand<T>(...args: (OpenDataQuery | QueryFunc<T>)[])

Define `$expand` system query option for getting nested objects

Read more about `$expand` at http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#_Toc31361039

    const items= await context.model('Orders')
        .asQueryable()
        .select(({id, orderStatus, orderDate}) => {
            return {
                id,
                orderStatus,
                orderDate
            }
        }).expand(
            (x) => x.customer,
            (x) => x.orderedItem
        ).getItems();

> `/Orders?$select=id,orderStatus,orderDate&$expand=customer,orderedItem`

or use query expressions for applying nested query options:

    import { any } from '@themost/query';

    const items= await context.model('People')
        .asQueryable()
        .expand(
            any((x) => x.address)
            .select(({id, streetAddress, addressLocalilty}) => ({
                id, streetAddress, addressLocalilty
            }))
        ).getItems();

> `/People?$expand=address($select=id,streetAddress,addressLocalilty;$expand=addressCountry)`