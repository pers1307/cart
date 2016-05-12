<?php
/**
 * ColumsHelper.php
 * Класс помогает распределить элементы по колонкам
 *
 * @author      Pereskokov Yurii
 * @version     0.9.1
 * @copyright   2015 Pereskokov Yurii
 * @license     Mediasite LLC
 * @link        http://www.mediasite.ru/
 */

namespace pers1307\helpers;

class ColumsHelper
{
    /** @var int */
    private $columns;

    /**
     * @param int $columns
     * Установка необходимого количества колонок, на которое потом пройдет распределение
     */
    public function setColumns($columns)
    {
        $this->columns = $columns;
    }

    /**
     * @param array $items
     * Распределение элементов по колонкам в горизонтальном порядке
     *
     * @return array
     */
    public function horizontal($items)
    {
        $count = count($items);

        $colons = [];

        for ($i = 0; $i < $this->columns; $i++) {
            $colons[$i] = [];
        }

        $countForColons = 0;

        for ($i = 0; $i < $count; $i++) {
            array_push($colons[$countForColons], $items[$i]);

            ++$countForColons;
            if ($countForColons > $this->columns -1 ) {
                $countForColons = 0;
            }
        }

        return $colons;
    }

    /**
     * Распределение элементов по колонкам в вертикальном порядке (пока не реализовано)
     * @param array $items
     * @return array
     */
    public function upright($items)
    {

        /*
        if ($countElementInColon < 1) {

        } elseif ($countElementInColon > 1 && $countElementInColon) {

        }
        */

        /*
        $stringCut = new StringCutHelper();
        $stringCut->setMaxLenght(80);

        foreach ($links as $key => $link) {
            $result = $stringCut->cutString($link['title']);
            $links[$key]['title'] = $result;
        }
        */

        return [];
    }
}