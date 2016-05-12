<?php
/**
 * StringCutHelper.php
 * Класс для правильного обрезания строки
 *
 * @author      Pereskokov Yurii
 * @version     1.2
 * @copyright   2015 Pereskokov Yurii
 * @license     Mediasite LLC
 * @link        http://www.mediasite.ru/
*/

namespace pers1307\helpers;

class StringCutHelper
{
    /**
     * @var string
     * Заполнитель по умолчанию: ' ...'
     */
    private $separator = ' ...';

    /** @var int */
    private $maxlenght;

    /**
     * @param string $sep
     * Установка необходимого заполнителя для конца строки
     */
    public function setSeparator($sep)
    {
        $this->separator = $sep;
    }

    /**
     * @param int $lenght
     * Установка максимальной длинны строки
     */
    public function setMaxLenght($lenght)
    {
        $this->maxlenght = $lenght;
    }

    /**
     * @param string $string
     * Метод принимает строку и возвращает её обрезанный вариант, с заполнителем на конце.
     * Обрезание строки происходит в сторону уменьшения строки, пока не встретится пробел.
     *
     * @return string
     */
    public function cutString($string)
    {
        $maxLenght = $this->maxlenght - mb_strlen($this->separator);

        if (mb_strlen($string) >= $maxLenght) {
            $symbol = mb_substr($string, $maxLenght, 1);

            if ($symbol === false) {
                return $string;
            }

            if ($symbol === ' ') {
                $result = mb_substr($string, 0, $maxLenght) . $this->separator;
            } else {
                $count = $maxLenght;
                while (mb_substr($string, $count, 1) !== ' ') {
                    $count--;
                }
                $result = mb_substr($string, 0, $count) . $this->separator;
            }

            return $result;
        } else {
            return $string;
        }
    }
}