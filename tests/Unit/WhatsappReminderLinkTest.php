<?php

namespace Tests\Unit;

use App\Services\WhatsappReminderLink;
use PHPUnit\Framework\TestCase;

class WhatsappReminderLinkTest extends TestCase
{
    public function test_normalizes_indonesian_phone_starting_with_0(): void
    {
        $this->assertEquals('6281234567890', WhatsappReminderLink::normalizePhone('081234567890'));
    }

    public function test_normalizes_phone_with_plus_62_prefix(): void
    {
        $this->assertEquals('6281234567890', WhatsappReminderLink::normalizePhone('+6281234567890'));
    }

    public function test_normalizes_phone_starting_with_8(): void
    {
        $this->assertEquals('6281234567890', WhatsappReminderLink::normalizePhone('81234567890'));
    }

    public function test_strips_non_digit_characters(): void
    {
        $this->assertEquals('6281234567890', WhatsappReminderLink::normalizePhone('0812-3456-7890'));
        $this->assertEquals('6281234567890', WhatsappReminderLink::normalizePhone('0812 3456 7890'));
        $this->assertEquals('6281234567890', WhatsappReminderLink::normalizePhone('(0812) 3456-7890'));
    }

    public function test_returns_null_for_too_short_phone(): void
    {
        $this->assertNull(WhatsappReminderLink::normalizePhone('081'));
    }

    public function test_returns_null_for_too_long_phone(): void
    {
        $this->assertNull(WhatsappReminderLink::normalizePhone('0812345678901234567'));
    }

    public function test_returns_null_for_empty_or_null(): void
    {
        $this->assertNull(WhatsappReminderLink::normalizePhone(null));
        $this->assertNull(WhatsappReminderLink::normalizePhone(''));
        $this->assertNull(WhatsappReminderLink::normalizePhone('---'));
    }
}
