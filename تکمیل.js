document.addEventListener('DOMContentLoaded', function() {
    // متغیرهای اصلی
    const cardWrapper = document.querySelector('.card-wrapper');
    const form = document.getElementById('smartPaymentForm');
    const sections = document.querySelectorAll('.form-section');
    const progressFill = document.querySelector('.progress-fill');
    const progressSteps = document.querySelectorAll('.step');
    const paymentMethods = document.querySelectorAll('.method');
    const cardMethod = document.getElementById('cardMethod');
    const qrMethod = document.getElementById('qrMethod');
    const walletMethod = document.getElementById('walletMethod');
    
    // متغیرهای ورودی کارت
    const seg1 = document.getElementById('seg1');
    const seg2 = document.getElementById('seg2');
    const seg3 = document.getElementById('seg3');
    const seg4 = document.getElementById('seg4');
    const cardHolder = document.getElementById('cardHolder');
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');
    const cvvInput = document.getElementById('cvv');
    const dynamicPassword = document.getElementById('dynamicPassword');
    const saveCardCheckbox = document.getElementById('saveCard');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    
    // متغیرهای نمایش کارت
    const cardNumber1 = document.getElementById('cardNumber1');
    const cardNumber2 = document.getElementById('cardNumber2');
    const cardNumber3 = document.getElementById('cardNumber3');
    const cardNumber4 = document.getElementById('cardNumber4');
    const cardHolderPreview = document.getElementById('cardHolderPreview');
    const cardExpiryPreview = document.getElementById('cardExpiryPreview');
    const cvvPreview = document.getElementById('cvvPreview');
    const cardBrand = document.getElementById('cardBrand');
    const bankName = document.getElementById('bankName');
    const bankLogo = document.getElementById('bankLogo');
    
    // متغیرهای بخش تایید
    const confirmCardNumber = document.getElementById('confirmCardNumber');
    const confirmCardHolder = document.getElementById('confirmCardHolder');
    const confirmBankName = document.getElementById('confirmBankName');
    const currentDateTime = document.getElementById('currentDateTime');
    
    // دکمه‌ها
    const nextButtons = document.querySelectorAll('.next-button');
    const backButtons = document.querySelectorAll('.back-button');
    const submitButton = document.querySelector('.submit-button');
    const toggleCvvButton = document.querySelector('.toggle-cvv');
    const requestPasswordButton = document.querySelector('.request-password');
    const savedCards = document.querySelectorAll('.saved-card');
    const walletPayButton = document.querySelector('.wallet-pay-button');
    
    // تایمر شمارنده معکوس
    const countdownElement = document.getElementById('countdown');
    let countdownInterval;
    let remainingTime = 600; // 10 دقیقه به ثانیه
    
    // رمزنگاری QR کد
    const qrCodeElement = document.getElementById('qrCode');
    
    // ===== بخش تایمر شمارنده معکوس =====
    function startCountdown() {
        updateCountdownDisplay();
        
        countdownInterval = setInterval(() => {
            remainingTime--;
            
            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                sessionExpired();
            } else {
                updateCountdownDisplay();
            }
        }, 1000);
    }
    
    function updateCountdownDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // تغییر رنگ تایمر در زمان‌های کم
        if (remainingTime < 60) {
            countdownElement.parentElement.classList.add('warning');
        }
    }
    
    function sessionExpired() {
        Swal.fire({
            title: 'پایان زمان پرداخت',
            text: 'زمان انجام تراکنش به پایان رسیده است. لطفاً مجدداً تلاش کنید.',
            icon: 'error',
            confirmButtonText: 'بازگشت به فروشگاه'
        }).then(() => {
            window.location.href = 'https://example.com/shop';
        });
    }
    
    // ===== بخش QR کد =====
    function generateQRCode() {
        if (window.QRCode && qrCodeElement) {
            new QRCode(qrCodeElement, {
                text: "https://example.com/pay/123456789",
                width: 180,
                height: 180,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
    
    // ===== بخش تشخیص نوع کارت و بانک =====
    const bankInfo = {
        '603799': { name: 'بانک ملی', logo: 'melli.png' },
        '589210': { name: 'بانک سپه', logo: 'sepah.png' },
        '627648': { name: 'بانک صادرات', logo: 'saderat.png' },
        '627961': { name: 'بانک صنعت و معدن', logo: 'sanat.png' },
        '603770': { name: 'بانک کشاورزی', logo: 'keshavarzi.png' },
        '628023': { name: 'بانک مسکن', logo: 'maskan.png' },
        '627760': { name: 'پست بانک', logo: 'post.png' },
        '502908': { name: 'بانک توسعه تعاون', logo: 'tosee.png' },
        '627412': { name: 'بانک اقتصاد نوین', logo: 'eghtesad.png' },
        '622106': { name: 'بانک پارسیان', logo: 'parsian.png' },
        '502229': { name: 'بانک پاسارگاد', logo: 'pasargad.png' },
        '627488': { name: 'بانک کارآفرین', logo: 'karafarin.png' },
        '621986': { name: 'بانک سامان', logo: 'saman.png' },
        '639346': { name: 'بانک سینا', logo: 'sina.png' },
        '639607': { name: 'بانک سرمایه', logo: 'sarmayeh.png' },
        '502806': { name: 'بانک شهر', logo: 'shahr.png' },
        '502938': { name: 'بانک دی', logo: 'day.png' },
        '603769': { name: 'بانک صادرات', logo: 'saderat.png' },
        '610433': { name: 'بانک ملت', logo: 'mellat.png' },
        '589463': { name: 'بانک رفاه', logo: 'refah.png' },
        '627353': { name: 'بانک تجارت', logo: 'tejarat.png' }
    };
    
    function detectCardType(cardNumber) {
        // تشخیص نوع کارت (ویزا، مستر، امکس و...)
        let cardType = '';
        let brandLogo = '';
        
        // نمونه تشخیص برند کارت
        if (cardNumber.startsWith('4')) {
            cardType = 'ویزا کارت';
            brandLogo = 'url(visa.png)';
        } else if (cardNumber.startsWith('5')) {
            cardType = 'مستر کارت';
            brandLogo = 'url(mastercard.png)';
        } else if (cardNumber.startsWith('6')) {
            cardType = 'شتاب';
            brandLogo = 'url(shetab.png)';
        }
        
        // تشخیص بانک صادرکننده
        let bankInfo = detectBank(cardNumber);
        
        return {
            type: cardType,
            logo: brandLogo,
            bank: bankInfo
        };
    }
    
    function detectBank(cardNumber) {
        // بررسی 6 رقم اول برای تشخیص بانک
        const prefix = cardNumber.substring(0, 6);
        
        for (let key in bankInfo) {
            if (prefix.startsWith(key)) {
                return bankInfo[key];
            }
        }
        
        return { name: 'نامشخص', logo: 'bank-logo.png' };
    }
    
    // ===== مدیریت ورودی‌ها =====
    function setupCardNumberInputs() {
        // عملکرد جهش خودکار بین فیلدهای شماره کارت
        const segments = [seg1, seg2, seg3, seg4];
        
        segments.forEach((segment, index) => {
            segment.addEventListener('input', function(e) {
                // حذف کاراکترهای غیر عددی
                this.value = this.value.replace(/\D/g, '');
                
                // نمایش در کارت
                updateCardNumberDisplay();
                
                // جهش خودکار به فیلد بعدی
                if (this.value.length === this.maxLength && index < segments.length - 1) {
                    segments[index + 1].focus();
                }
                
                // بررسی تکمیل بودن شماره کارت
                checkCardNumberCompletion();
            });
            
            // امکان برگشت با کلید Backspace
            segment.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                    segments[index - 1].focus();
                }
            });
        });
        
        // کلیک روی کارت‌های ذخیره شده
        savedCards.forEach(card => {
            card.addEventListener('click', function() {
                const cardNumber = this.dataset.card;
                const parts = cardNumber.split('-');
                
                seg1.value = parts[0];
                seg2.value = parts[1];
                seg3.value = parts[2].replace('*', '');
                seg4.value = parts[3];
                
                updateCardNumberDisplay();
                checkCardNumberCompletion();
            });
        });
    }
    
    function updateCardNumberDisplay() {
        // نمایش شماره کارت روی تصویر کارت
        cardNumber1.textContent = seg1.value.padEnd(4, '#');
        cardNumber2.textContent = seg2.value.padEnd(4, '#');
        cardNumber3.textContent = seg3.value.padEnd(4, '#');
        cardNumber4.textContent = seg4.value.padEnd(4, '#');
        
        // تشخیص نوع کارت و بانک
        const fullCardNumber = seg1.value + seg2.value + seg3.value + seg4.value;
        if (fullCardNumber.length >= 6) {
            const cardInfo = detectCardType(fullCardNumber);
            
            // نمایش لوگوی برند کارت
            if (cardInfo.logo) {
                cardBrand.style.backgroundImage = cardInfo.logo;
            }
            
            // نمایش اطلاعات بانک
            if (cardInfo.bank) {
                bankName.textContent = cardInfo.bank.name;
                bankLogo.src = cardInfo.bank.logo;
            }
        }
    }
    
    function checkCardNumberCompletion() {
        // بررسی تکمیل بودن شماره کارت
        const isComplete = seg1.value.length === 4 && 
                          seg2.value.length === 4 && 
                          seg3.value.length === 4 && 
                          seg4.value.length === 4;
        
        // غیرفعال/فعال کردن دکمه مرحله بعد
        nextButtons[0].disabled = !isComplete;
        
        // اعتبارسنجی با الگوریتم Luhn
        if (isComplete) {
            const fullCardNumber = seg1.value + seg2.value + seg3.value + seg4.value;
            const isValid = validateCardNumber(fullCardNumber);
            
            if (!isValid) {
                Swal.fire({
                    title: 'خطا',
                    text: 'شماره کارت وارد شده معتبر نیست.',
                    icon: 'error',
                    confirmButtonText: 'تصحیح'
                });
                nextButtons[0].disabled = true;
            }
        }
    }
    
    function validateCardNumber(cardNumber) {
        // اعتبارسنجی شماره کارت با الگوریتم Luhn
        let sum = 0;
        let alternate = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let n = parseInt(cardNumber.substring(i, i + 1));
            
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n = (n % 10) + 1;
                }
            }
            
            sum += n;
            alternate = !alternate;
        }
        
        return (sum % 10 === 0);
    }
    
    function setupCardHolderInput() {
        cardHolder.addEventListener('input', function() {
            // نمایش نام دارنده کارت روی تصویر کارت
            cardHolderPreview.textContent = this.value || 'نام و نام خانوادگی';
            
            // بررسی تکمیل بودن فرم مرحله دوم
            checkSecondStepCompletion();
        });
    }
    
    function setupExpiryInputs() {
        // ورودی ماه
        monthInput.addEventListener('input', function() {
            // حذف کاراکترهای غیر عددی
            this.value = this.value.replace(/\D/g, '');
            
            // محدود کردن ورودی ماه به اعداد مجاز
            const monthVal = parseInt(this.value);
            if (monthVal > 12) {
                this.value = '12';
            } else if (monthVal < 1 && this.value.length === 2) {
                this.value = '01';
            }
            
            // جهش خودکار به فیلد سال
            if (this.value.length === 2) {
                yearInput.focus();
            }
            
            updateExpiryDisplay();
            checkSecondStepCompletion();
        });
        
        // ورودی سال
        yearInput.addEventListener('input', function() {
            // حذف کاراکترهای غیر عددی
            this.value = this.value.replace(/\D/g, '');
            
            updateExpiryDisplay();
            checkSecondStepCompletion();
        });
        
        // امکان برگشت با Backspace
        yearInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0) {
                monthInput.focus();
            }
        });
    }
    
    function updateExpiryDisplay() {
        // نمایش تاریخ انقضا روی تصویر کارت
        const month = monthInput.value.padStart(2, '0');
        const year = yearInput.value.padStart(2, '0');
        
        cardExpiryPreview.textContent = month && year ? `${month}/${year}` : 'MM/YY';
    }
    
    function setupCvvInput() {
        // ورودی CVV
        cvvInput.addEventListener('focus', function() {
            // چرخاندن کارت به پشت
            cardWrapper.classList.add('flipped');
        });
        
        cvvInput.addEventListener('blur', function() {
            // برگرداندن کارت به جلو
            cardWrapper.classList.remove('flipped');
        });
        
        cvvInput.addEventListener('input', function() {
            // حذف کاراکترهای غیر عددی
            this.value = this.value.replace(/\D/g, '');
            
            // نمایش CVV روی تصویر کارت
            updateCvvDisplay();
            
            // بررسی تکمیل بودن فرم مرحله دوم
            checkSecondStepCompletion();
        });
        
        // دکمه نمایش/مخفی کردن CVV
        toggleCvvButton.addEventListener('click', function() {
            const isPassword = cvvInput.type === 'password';
            cvvInput.type = isPassword ? 'text' : 'password';
            this.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }
    
    function updateCvvDisplay() {
        // نمایش CVV روی تصویر کارت
        const cvvValue = cvvInput.value;
        cvvPreview.textContent = cvvValue || '***';
    }
    
    function checkSecondStepCompletion() {
    // فقط بررسی تکمیل بودن فیلدها
    const isComplete = cardHolder.value.length > 3 && 
                      monthInput.value.length === 2 && 
                      yearInput.value.length === 2 && 
                      cvvInput.value.length >= 3;
    
    // غیرفعال/فعال کردن دکمه مرحله بعد
    nextButtons[1].disabled = !isComplete;
}

    
    function setupFinalCheckbox() {
        // بررسی موافقت با قوانین
        agreeTermsCheckbox.addEventListener('change', function() {
            submitButton.disabled = !this.checked;
        });
    }
    
    function updateConfirmationDetails() {
        // نمایش اطلاعات در مرحله تایید نهایی
        const fullCardNumber = seg1.value + seg2.value + seg3.value + seg4.value;
        // نمایش شماره کارت با ستاره‌گذاری
        confirmCardNumber.textContent = `${seg1.value}-${seg2.value}-****-${seg4.value}`;
        
        // نام دارنده کارت
        confirmCardHolder.textContent = cardHolder.value;
        
        // اطلاعات بانک
        const cardInfo = detectCardType(fullCardNumber);
        confirmBankName.textContent = cardInfo.bank.name;
        
        // تاریخ و زمان فعلی
        const now = new Date();
        const formattedDate = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        currentDateTime.textContent = formattedDate;
    }
    
    // ===== گردش بین مراحل فرم =====
    function goToNextStep(currentIndex) {
        // مخفی کردن بخش فعلی
        sections[currentIndex].classList.remove('active');
        // نمایش بخش بعدی
        sections[currentIndex + 1].classList.add('active');
        
        // بروزرسانی نوار پیشرفت
        updateProgressBar(currentIndex + 1);
        
        // بروزرسانی اطلاعات مرحله تایید
        if (currentIndex + 1 === 2) {
            updateConfirmationDetails();
        }
        
        // برگرداندن کارت به حالت اولیه
        cardWrapper.classList.remove('flipped');
    }
    
    function goToPrevStep(currentIndex) {
        // مخفی کردن بخش فعلی
        sections[currentIndex].classList.remove('active');
        // نمایش بخش قبلی
        sections[currentIndex - 1].classList.add('active');
        
        // بروزرسانی نوار پیشرفت
        updateProgressBar(currentIndex - 1);
        
        // برگرداندن کارت به حالت اولیه
        cardWrapper.classList.remove('flipped');
    }
    
    function updateProgressBar(step) {
        // محاسبه درصد پیشرفت
        const progress = (step / (sections.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
        
        // بروزرسانی مراحل
        progressSteps.forEach((stepEl, index) => {
            if (index <= step) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });
    }
    
    // ===== درخواست رمز پویا =====
    function setupDynamicPasswordRequest() {
        requestPasswordButton.addEventListener('click', function() {
            const fullCardNumber = seg1.value + seg2.value + seg3.value + seg4.value;
            
            if (fullCardNumber.length !== 16) {
                Swal.fire({
                    title: 'خطا',
                    text: 'لطفاً ابتدا شماره کارت را به درستی وارد کنید.',
                    icon: 'error',
                    confirmButtonText: 'باشه'
                });
                return;
            }
            
            // شبیه‌سازی درخواست رمز پویا
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>در حال ارسال...</span>';
            
            setTimeout(() => {
                Swal.fire({
                    title: 'ارسال رمز پویا',
                    text: 'رمز پویا به شماره موبایل شما ارسال شد.',
                    icon: 'success',
                    confirmButtonText: 'متوجه شدم'
                });
                
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-key"></i> <span>درخواست مجدد</span>';
                
                // فوکوس روی فیلد رمز پویا
                dynamicPassword.focus();
            }, 2000);
        });
    }
    
    // ===== مدیریت روش‌های پرداخت =====
    function setupPaymentMethods() {
        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                // حذف کلاس active از همه
                paymentMethods.forEach(m => m.classList.remove('active'));
                // اضافه کردن کلاس active به روش انتخاب شده
                this.classList.add('active');
                
                // نمایش بخش مربوطه
                const methodType = this.dataset.method;
                
                // مخفی کردن همه روش‌ها
                cardMethod.style.display = 'none';
                qrMethod.style.display = 'none';
                walletMethod.style.display = 'none';
                form.style.display = 'none';
                
                // نمایش روش انتخاب شده
                if (methodType === 'card') {
                    cardMethod.style.display = 'block';
                    form.style.display = 'block';
                } else if (methodType === 'qr') {
                    qrMethod.style.display = 'block';
                    generateQRCode();
                } else if (methodType === 'wallet') {
                    walletMethod.style.display = 'flex';
                }
            });
        });
        
        // تنظیم دکمه پرداخت با کیف پول
        if (walletPayButton) {
            walletPayButton.addEventListener('click', function() {
                Swal.fire({
                    title: 'تایید پرداخت',
                    text: 'آیا از پرداخت با کیف پول اطمینان دارید؟',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'بله، پرداخت شود',
                    cancelButtonText: 'انصراف'
                }).then((result) => {
                    if (result.isConfirmed) {
                        simulatePayment();
                    }
                });
            });
        }
    }
    
    // ===== ارسال فرم و تکمیل پرداخت =====
    function setupFormSubmission() {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // نمایش حالت در حال بارگیری
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            // شبیه‌سازی پرداخت
            simulatePayment();
        });
    }
    
    function simulatePayment() {
        // شبیه‌سازی پرداخت
        setTimeout(() => {
            // نمایش رسید پرداخت
            Swal.fire({
                title: 'پرداخت موفق',
                html: `
                    <div class="payment-receipt">
                        <div class="receipt-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="receipt-details">
                            <p>مبلغ: <strong>2,500,000 تومان</strong></p>
                            <p>شماره پیگیری: <strong>12345678</strong></p>
                            <p>تاریخ: <strong>${new Date().toLocaleDateString('fa-IR')}</strong></p>
                        </div>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'بازگشت به فروشگاه'
            }).then(() => {
                // هدایت به صفحه فروشگاه یا رسید
                window.location.href = 'https://example.com/receipt';
            });
        }, 3000);
    }
    
    // ===== راه‌اندازی اولیه =====
    function init() {
        // راه‌اندازی تایمر
        startCountdown();
        
        // تنظیم ورودی‌ها
        setupCardNumberInputs();
        setupCardHolderInput();
        setupExpiryInputs();
        setupCvvInput();
        setupDynamicPasswordRequest();
        setupFinalCheckbox();
        
        // تنظیم پیمایش بین مراحل
        nextButtons.forEach((button, index) => {
            button.addEventListener('click', function() {
                goToNextStep(index);
            });
        });
        
        backButtons.forEach((button, index) => {
            button.addEventListener('click', function() {
                // شاخص متفاوت است چون دکمه‌های برگشت در بخش اول وجود ندارند
                goToPrevStep(index + 1);
            });
        });
        
        // تنظیم روش‌های پرداخت
        setupPaymentMethods();
        
        // تنظیم ارسال فرم
        setupFormSubmission();
        
        // تنظیم QR کد
        if (window.QRCode) {
            generateQRCode();
        }
    }
    
    // شروع برنامه
    init();
});
/**
 * تابع کمکی برای فرمت کردن مبلغ
 * @param {number} amount - مبلغ
 * @returns {string} مبلغ فرمت شده
 */
function formatAmount(amount) {
    return new Intl.NumberFormat('fa-IR').format(amount);
}

/**
 * تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
 * @param {string} str - رشته حاوی اعداد انگلیسی
 * @returns {string} رشته با اعداد فارسی
 */
function toFarsiNumber(str) {
    if (!str) return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, x => farsiDigits[x]);
}

/**
 * تابع کمکی برای تبدیل اعداد فارسی به انگلیسی
 * @param {string} str - رشته حاوی اعداد فارسی
 * @returns {string} رشته با اعداد انگلیسی
 */
function toEnglishNumber(str) {
    if (!str) return '';
    return str.toString()
        .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

/**
 * تابع کمکی برای تشخیص دستگاه موبایل
 * @returns {boolean} آیا دستگاه موبایل است
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * تابع کمکی برای تشخیص مرورگر
 * @returns {string} نام مرورگر
 */
function detectBrowser() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) return "IE";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    
    return "Unknown";
}
// راه‌اندازی درگاه پرداخت هنگام بارگذاری صفحه
document.addEventListener('DOMContentLoaded', () => {
    try {
        const smartPayment = new SmartPayment();
        
        // ذخیره نمونه در متغیر جهانی برای دسترسی در کنسول (فقط برای اهداف توسعه)
        window.smartPayment = smartPayment;
        
        console.log('درگاه پرداخت هوشمند با موفقیت راه‌اندازی شد.');
    } catch (error) {
        console.error('خطا در راه‌اندازی درگاه پرداخت:', error);
    }
});
/**
 * فعال‌سازی دکمه‌های درگاه پرداخت
 * این فایل برای اطمینان از عملکرد صحیح دکمه‌ها استفاده می‌شود
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('فعال‌سازی دکمه‌های درگاه پرداخت...');
    
    // فعال‌سازی دکمه‌های مرحله بعد
    document.querySelectorAll('.next-button').forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`دکمه بعدی ${index} کلیک شد`);
            
            // یافتن بخش فعلی و بخش بعدی
            const currentSection = this.closest('.form-section');
            const nextSection = currentSection.nextElementSibling;
            
            if (nextSection && nextSection.classList.contains('form-section')) {
                // مخفی کردن بخش فعلی
                currentSection.classList.remove('active');
                
                // نمایش بخش بعدی
                nextSection.classList.add('active');
                
                // به‌روزرسانی نوار پیشرفت
                updateProgressBar(index + 1);
            }
        });
    });
    
    // فعال‌سازی دکمه‌های مرحله قبل
    document.querySelectorAll('.back-button').forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`دکمه قبلی ${index} کلیک شد`);
            
            // یافتن بخش فعلی و بخش قبلی
            const currentSection = this.closest('.form-section');
            const prevSection = currentSection.previousElementSibling;
            
            if (prevSection && prevSection.classList.contains('form-section')) {
                // مخفی کردن بخش فعلی
                currentSection.classList.remove('active');
                
                // نمایش بخش قبلی
                prevSection.classList.add('active');
                
                // به‌روزرسانی نوار پیشرفت
                updateProgressBar(index);
            }
        });
    });
    
    // فعال‌سازی دکمه ثبت نهایی
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('دکمه ثبت نهایی کلیک شد');
            
            // نمایش وضعیت بارگذاری
            this.classList.add('loading');
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';
            
            // شبیه‌سازی ارسال به سرور
            setTimeout(() => {
                // نمایش پیام موفقیت
                showAlert('پرداخت با موفقیت انجام شد', 'success');
                
                // ریدایرکت به صفحه موفقیت
                setTimeout(() => {
                    window.location.href = window.location.href.includes('?') ? 
                        window.location.href + '&success=true' : 
                        window.location.href + '?success=true';
                }, 2000);
            }, 2000);
        });
    }
    
    // فعال‌سازی چک‌باکس موافقت با قوانین
    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms && submitButton) {
        agreeTerms.addEventListener('change', function() {
            submitButton.disabled = !this.checked;
        });
        
        // تنظیم وضعیت اولیه دکمه ثبت
        submitButton.disabled = !agreeTerms.checked;
    }
    
    // فعال‌سازی دکمه‌های روش پرداخت
    document.querySelectorAll('.method').forEach(method => {
        method.addEventListener('click', function() {
            // حذف کلاس active از همه
            document.querySelectorAll('.method').forEach(m => m.classList.remove('active'));
            
            // اضافه کردن کلاس active به روش انتخاب شده
            this.classList.add('active');
            
            // نمایش بخش مربوطه
            const methodType = this.dataset.method;
            if (methodType) {
                showPaymentMethod(methodType);
            }
        });
    });
    
    console.log('دکمه‌های درگاه پرداخت با موفقیت فعال شدند.');
});

/**
 * به‌روزرسانی نوار پیشرفت
 * @param {number} step - شماره مرحله فعلی
 */
function updateProgressBar(step) {
    const progressSteps = document.querySelectorAll('.step');
    const progressFill = document.querySelector('.progress-fill');
    
    if (!progressSteps.length || !progressFill) return;
    
    // به‌روزرسانی کلاس‌های مراحل
    progressSteps.forEach((stepEl, index) => {
        if (index < step) {
            stepEl.classList.add('completed');
            stepEl.classList.remove('active');
        } else if (index === step) {
            stepEl.classList.add('active');
            stepEl.classList.remove('completed');
        } else {
            stepEl.classList.remove('active', 'completed');
        }
    });
    
    // به‌روزرسانی نوار پیشرفت
    progressFill.style.width = `${((step + 1) / progressSteps.length) * 100}%`;
}

/**
 * نمایش روش پرداخت انتخاب شده
 * @param {string} methodType - نوع روش پرداخت
 */
function showPaymentMethod(methodType) {
    const cardMethod = document.getElementById('cardMethod');
    const qrMethod = document.getElementById('qrMethod');
    const walletMethod = document.getElementById('walletMethod');
    const form = document.getElementById('smartPaymentForm');
    
    // مخفی کردن همه روش‌ها
    if (cardMethod) cardMethod.style.display = 'none';
    if (qrMethod) qrMethod.style.display = 'none';
    if (walletMethod) walletMethod.style.display = 'none';
    
    // نمایش روش انتخاب شده
    switch (methodType) {
        case 'card':
            if (cardMethod) cardMethod.style.display = 'flex';
            if (form) form.style.display = 'block';
            break;
        case 'qr':
            if (qrMethod) qrMethod.style.display = 'block';
            generateQRCode();
            break;
        case 'wallet':
            if (walletMethod) walletMethod.style.display = 'flex';
            break;
    }
    
    console.log(`روش پرداخت ${methodType} انتخاب شد`);
}

/**
 * تولید QR کد
 */
function generateQRCode() {
    const qrContainer = document.getElementById('qrCode');
    if (!qrContainer) return;
    
    qrContainer.innerHTML = '';
    
    // اگر کتابخانه QRCode موجود است، از آن استفاده کن
    if (window.QRCode) {
        try {
            new QRCode(qrContainer, {
                text: `https://example.com/pay/${Date.now()}`,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('خطا در تولید QR کد:', error);
            qrContainer.innerHTML = '<div class="qr-error">خطا در تولید QR کد</div>';
        }
    } else {
        // اگر کتابخانه موجود نیست، یک تصویر نمایشی نشان بده
        qrContainer.innerHTML = `
            <div class="qr-placeholder">
                <img src="qr-sample.png" alt="QR Code" width="200" height="200">
            </div>
        `;
    }
}

/**
 * نمایش پیام هشدار
 * @param {string} message - متن پیام
 * @param {string} type - نوع پیام (success, error, warning, info)
 */
function showAlert(message, type = 'info') {
    // اگر SweetAlert موجود است، از آن استفاده کن
    if (window.Swal) {
        Swal.fire({
            text: message,
            icon: type,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    } else {
        // در غیر این صورت، از alert ساده استفاده کن
        alert(message);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');
    const nextButton = document.querySelectorAll('.next-button')[1];
    const cardHolder = document.getElementById('cardHolder');
    const cvvInput = document.getElementById('cvv');

    // تنظیم رویدادهای ورودی ماه
    if (monthInput) {
        monthInput.addEventListener('input', function() {
            // حذف کاراکترهای غیر عددی
            this.value = this.value.replace(/\D/g, '');
            
            // محدود کردن به دو رقم
            if (this.value.length > 2) {
                this.value = this.value.slice(0, 2);
            }
            
            // جهش خودکار به فیلد سال
            if (this.value.length === 2) {
                yearInput.focus();
            }

            updateCardDisplay();
            checkFormCompletion();
        });
    }

    // تنظیم رویدادهای ورودی سال
    if (yearInput) {
        yearInput.addEventListener('input', function() {
            // حذف کاراکترهای غیر عددی
            this.value = this.value.replace(/\D/g, '');
            
            // محدود کردن به دو رقم
            if (this.value.length > 2) {
                this.value = this.value.slice(0, 2);
            }

            updateCardDisplay();
            checkFormCompletion();
        });
    }

    // به‌روزرسانی نمایش کارت
    function updateCardDisplay() {
        const cardExpiryPreview = document.getElementById('cardExpiryPreview');
        if (cardExpiryPreview) {
            const month = monthInput.value.padStart(2, '0');
            const year = yearInput.value.padStart(2, '0');
            cardExpiryPreview.textContent = month && year ? `${month}/${year}` : 'MM/YY';
        }
    }

    // بررسی تکمیل فرم
    function checkFormCompletion() {
        if (nextButton) {
            const isComplete = monthInput.value.length === 2 && 
                             yearInput.value.length === 2 && 
                             cardHolder.value.length > 3 && 
                             cvvInput.value.length >= 3;
            
            nextButton.disabled = !isComplete;
        }
    }

    // اضافه کردن رویدادهای سایر فیلدها
    if (cardHolder) {
        cardHolder.addEventListener('input', checkFormCompletion);
    }
    
    if (cvvInput) {
        cvvInput.addEventListener('input', checkFormCompletion);
    }
});
