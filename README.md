# Publisher helpers

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

Кароч, это набор набор хэлперов для Publisher'а.
Помогает упростить работу во view.

## Install

Используй composer и все.

``` bash
$ php composer.phar require --prefer-dist pers1307/helpers "dev-master"
```

## Капитан, что мне делать с этим?

StringCutHelper - класс режет строку до указанного размера.
Причем, разрежет по целым словам. Без половинчатых слов.

``` php
use pers1307\helpers\StringCutHelper;

$title = 'Hello yellow';
$stringCutTitle = new StringCutHelper();
$stringCutTitle->setMaxLenght(100);
$stringCutTitle->setSeparator('');
$title = $stringCutTitle->cutString($title);
```

RowHelper - класс, который поможет тебе, вывести элементы построчно.
И конечно, правильно вписать все это в верстку

``` html
<? use pers1307\helpers\RowHelper; ?>

<div class="wrap">
    <? $helper = new RowHelper(); ?>
    <? $helper->beforeCycle('<div>', '</div>', 3); ?>

    <? foreach($articles as $item): ?>
        <?
        $imageUrl = MSFiles::getImageUrl($item['img'], 'min');
        $title = $item['name'];
        $url = $model->getArticleLink($item['id']);

        if (empty($imageUrl)) {
            $imageUrl = '/DESIGN/SITE/images/no-image/no-image_160_160.png';
        }
        $htmlItem = "
            <a href='$url'>
                <div><img src='$imageUrl' alt='картинка подраздела $title'/></div>
                <span>$title</span>
            </a>
        ";

        if (empty($title)) {
            continue;
        }

        $return = $helper->inCycle($htmlItem);

        if ($return === 'continue') {
            continue;
        }
        ?>
    <? endforeach; ?>

    <? $helper->afterCycle(); ?>
</div>
```

ColumsHelper - класс, который разобъет передаваемы items на колонки,
горизонтально или вертикально (ну тут пока запара)и вернет эти колонки как массивы,
оч удобно, trust me.

``` php
use pers1307\helpers\ColumsHelper;

$tools = $query->getItems();

$columsHelper = new ColumsHelper();
$columsHelper->setColumns(4);
$tools = $columsHelper->horizontal($tools);
```

## Credits

- [Pereskokov Yurii (pers1307)](https://github.com/pers1307)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
