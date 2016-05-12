<?php
/**
 * RowHelper.php
 * Класс для построчного выведения товаров
 *
 * @author      Pereskokov Yurii
 * @version     1.0
 * @copyright   2015 Pereskokov Yurii
 * @license     Mediasite LLC
 * @link        http://www.mediasite.ru/
 */

namespace pers1307\helpers;

/**
 * Class RowHelper
 * todo: добавить проверку на title, если он пуст, то такой товар пропускать!
 */
class RowHelper
{
    /** @var string */
    private $count;

    /** @var string */
    private $beginTag;

    /** @var string */
    private $endTag;

    /** @var int */
    private $itemInRow;

    /**
     * @param string $beginTag
     * @param string $endTag
     * @param int $itemInRow
     */
    public function beforeCycle($beginTag, $endTag, $itemInRow)
    {
        $this->count = 0;
        $this->beginTag = $beginTag;
        $this->endTag = $endTag;
        $this->itemInRow = $itemInRow;
    }

    /**
     * @param string $htmlItem
     *
     * @return string
     */
    public function inCycle($htmlItem)
    {
        if ($this->count === 0) {
            echo $this->beginTag;
        }

        echo $htmlItem;

        if ($this->count >= $this->itemInRow) {
            echo $this->endTag;
            $this->count = 0;
            return 'continue';
        }

        $this->count++;
    }

    public function afterCycle()
    {
        if ($this->count <= 3 && $this->count != 0) {
            echo $this->endTag;
            $this->count = 0;
        }
    }
}