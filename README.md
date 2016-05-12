# Publisher base cart

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

Кароч, это базовый класс для корзины Publisher'а.
От него можно унаследоваться и кастомизировать под свой проект.

Пока проект можно использовать только как сырую основу

## Install

Используй composer и все.

``` bash
$ php composer.phar require --prefer-dist pers1307/cart "dev-master"
```

## Как мне с этим работать?

Сам пока не знаю ...

Таблица

``` sql
DROP TABLE IF EXISTS `mp_cart`;
    CREATE TABLE `mp_cart` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` varchar(255) NOT NULL,
    `item_id` int(11)      NOT NULL,
    `amount`  int(11)      NOT NULL,
    `cost`    double(11)   NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
```


## Автор

- [Pereskokov Yurii (pers1307)](https://github.com/pers1307)

## Лицензия

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.