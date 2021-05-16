'use strict'

$(function(){

    // フォントインストール
    (function(d) {
        var config = {
          kitId: 'xwl6kfn',
          scriptTimeout: 3000,
          async: true
        },
        h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
    })(document);
    
    const writerChoiceButton = $(".c-genre-choice-btn.writer")[0];
    const wordChoiceButton = $(".c-genre-choice-btn.word")[0];

    const writerSearchSeries = $(".p-search-series.writer")[0];
    const wordSearchSeries = $(".p-search-series.word")[0];

    const writerArray = Array.from(document.getElementsByClassName("c-writer"));

    const searchBtn = $(".c-search-btn")[0];
    const crossBtn = $(".c-cross-btn")[0];

    const searchExeBtn = $(".c-search-exe-btn")[0];

    var displayData = [];

    // 歌い手から絞る or キーワードから絞る を選ぶ
    const writerChoiceButtonClick = function() {
        if (!this.classList.contains("exe")){
            this.classList.add("exe");
            writerSearchSeries.classList.add("exe");
            wordChoiceButton.classList.remove("exe");
            wordSearchSeries.classList.remove("exe");
        }    
    }
    const wordChoiceButtonClick = function() {
        if (!this.classList.contains("exe")){
            this.classList.add("exe");
            wordSearchSeries.classList.add("exe");
            writerChoiceButton.classList.remove("exe");
            writerSearchSeries.classList.remove("exe");
        }    
    }

    writerChoiceButton.onclick = writerChoiceButtonClick;
    wordChoiceButton.onclick = wordChoiceButtonClick;

    // 歌い手選択
    const choiceWriter = function() {
        if (!this.classList.contains("search")){
            this.classList.add("search");
        } else {
            this.classList.remove("search");
        }
    }

    // キーワード選択
    const searchWordExe = function() {
        let word = $(".c-input")[0].value;
        return word;
    }

    writerArray.forEach(writer => {
        writer.onclick = choiceWriter;
    })

    // 検索画面表示
    const displaySearchScreen = function() {
        $(".p-search-screen")[0].classList.add("exe");
    }
    searchBtn.onclick = displaySearchScreen;

    //検索画面非表示
    const hideSearchScreen = function() {
        $(".p-search-screen")[0].classList.remove("exe");
    }
    crossBtn.onclick = hideSearchScreen;

    const searchWriterExe = function() {
        let chosenArray = [];
        writerArray.forEach(writer => {
            if (writer.classList.contains("search")) {
                chosenArray.push(writer.textContent);
            }
        })
        return chosenArray;
    }

    function scrollToAnker(hash) {
        var adjust = -100;
        var time = 500;
        let target = $(hash);
        let position = target.offset().top + adjust;
        $('body,html').stop().animate({scrollTop:position}, time, 'swing');
    }
    
    /* エラー文字列の生成 */
    function errorHandler(args) {
        var error;
        // errorThrownはHTTP通信に成功したときだけ空文字列以外の値が定義される
        if (args[2]) {
            try {
                // JSONとしてパースが成功し、且つ {"error":"..."} という構造であったとき
                // (undefinedが代入されるのを防ぐためにtoStringメソッドを使用)
                error = JSON.parse(args[0].responseText).error.toString();
            } catch (e) {
                // パースに失敗した、もしくは期待する構造でなかったとき
                // (PHP側にエラーがあったときにもデバッグしやすいようにレスポンスをテキストとして返す)
                error = 'parsererror(' + args[2] + '): ' + args[0].responseText;
            }
        } else {
            // 通信に失敗したとき
            error = args[1] + '(HTTP request failed)';
        }
        return error;
    }

    $(".c-search-exe-btn").click(function () {
        let word = searchWordExe();
        let writerArray = searchWriterExe();

        if (document.getElementById("display") != null) {
            document.getElementById("display").removeAttribute("id");
        }
        // Ajax通信を開始する
        $.ajax({
            url: 'php/search.php', 
            type: 'post', // getかpostを指定(デフォルトは前者)
            dataType: 'json', // 「json」を指定するとresponseがJSONとしてパースされたオブジェクトになる
            data: { // 送信データを指定(getの場合は自動的にurlの後ろにクエリとして付加される)
                // word: "深紫",
                // word: "",
                word: word,
                writers: writerArray,
            },
        })
        // ・ステータスコードは正常で、dataTypeで定義したようにパース出来たとき
        .done(function (data) {
            $(".p-search-screen").removeClass("exe");
            console.log("成功");
            console.log(data);
            displayData = data;
            // 短歌表示エリアの一番下に検索した中で最初の短歌、画像を追加する
            loadContent();
            // 一番下の短歌表示エリアまで飛ぶ
            let tankaDisplayArray = Array.from(document.getElementsByClassName("p-tanka-display-area"));
            let index = tankaDisplayArray.length - 1;
            console.log(index);
            tankaDisplayArray[index].id = "display";
            var urlHash = location.hash;
            scrollToAnker(urlHash);
            
        })
        // ・サーバからステータスコード400以上が返ってきたとき
        // ・ステータスコードは正常だが、dataTypeで定義したようにパース出来なかったとき
        // ・通信に失敗したとき
        .fail(function () {
            console.log("失敗");
            console.log(errorHandler(arguments));
        });
    });

    //設定
    const translateXRateArray = [0.01, 0.01, 0.01, -0.01, -0.01,]
    const translateYRateArray = [-0.02, -0.02, -0.02, -0.02, -0.02,]
    const rotateRateArray = [0.02, 0.02, 0.02, -0.02, -0.02,]

    var tankaArray = Array.from(document.getElementsByClassName("c-tanka"));
    var imgArray = Array.from(document.getElementsByClassName("c-tanka-img"));

    // フェードインアウト速度
    var transparentRateArray = []

    function getTransparentRate() {
        let transparentRate = {
            tankaFadein: 1 / $('.p-tanka-fadein-area:last').height(), 
            tankaFadeout: -1 / $('.p-tanka-fadeout-area:last').height(), 
            imgFadein: 1 / $('.p-img-fadein-area:last').height(), 
            imgFadeout: -1 / $('.p-img-fadeout-area:last').height(), 
        }
        return transparentRate;
    }

    // フェードインアウト開始位置
    var scaleArray = [];
    function getscale() {
        let scale = {
            // スクロール開始(一つ目)
            // 短歌フェードイン位置
            tankaFadein: $('.p-tanka-fadein-area:last').offset().top, 
            // 短歌フェードアウト位置
            tankaFadeout: $('.p-tanka-fadeout-area:last').offset().top, 
            // 短歌非表示位置
            tankaNodisplay: $('.p-tanka-no-display-area-2:last').offset().top, 
            // 画像フェードイン位置
            imgFadein: $('.p-img-fadein-area:last').offset().top, 
            // 画像フェードアウト位置
            imgFadeout: $('.p-img-fadeout-area:last').offset().top, 
            // 画像非表示位置
            imgNodisplay: $('.p-img-fadeout-area:last').offset().top + $('.p-img-fadeout-area:last').height(), 
        }
        return scale;
    }

    var sentenceArray = [];
    function getSentence() {
        let sentence = [];
        sentence.push($('.c-first-sentence:last')[0]);
        sentence.push($('.c-second-sentence:last')[0]);
        sentence.push($('.c-third-sentence:last')[0]);
        sentence.push($('.c-forth-sentence:last')[0]);
        sentence.push($('.c-fifth-sentence:last')[0]);

        return sentence;
    }

    const contents = $(".p-contents-series")[0];
    const imgDisplayStage = $(".p-img-display-stage-series")[0];
    const tankaDisplayStage = $(".p-tanka-display-stage-series")[0];

    const infiniteScrollObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if ( ! entry.isIntersecting ) return;

            console.log(entry);
            loadContent();
        });
    });

    infiniteScrollObserver.observe($(".l-footer")[0]);

    const loadContent = async () => {
        let firstSentence;
        let secondSentence;
        let thirdSentence;
        let forthSentence;
        let fifthSentence;
        let writer;
        let works;
        if(displayData.length) {
            let index = Math.floor(Math.random() * displayData.length);
            firstSentence = displayData[index].first_sentence;
            secondSentence = displayData[index].second_sentence;
            thirdSentence = displayData[index].third_sentence;
            forthSentence = displayData[index].forth_sentence;
            fifthSentence = displayData[index].fifth_sentence;
        } else {
            firstSentence = "やはらかく";
            secondSentence = "深紫の";
            thirdSentence = "天鵞絨を";
            forthSentence = "なづる心地か";
            fifthSentence = "春の暮れゆく";
            writer = "芥川龍之介";
            works = "芥川龍之介作品集";
        }
        contents.insertAdjacentHTML(
            'beforeend',
            '<div class="p-tanka-and-img next">' + 
            '<img class="c-tanka-img none" src="https://s3.ap-northeast-1.amazonaws.com/tanka-bucket/album1/_10.jpg">' + 
            '<div class="c-tanka none u-color-white l-flex-column">' + 
            '<p class="u-kinuta-22-regular-text u-margin-tanka l-flex-row">' + 
            `<span class="c-sentence c-first-sentence">${firstSentence}</span>` + 
            `<span class="c-sentence c-second-sentence">${secondSentence}</span>` + 
            `<span class="c-sentence c-third-sentence">${thirdSentence}</span>` + 
            '</p>' + 
            '<p class="u-kinuta-22-regular-text u-margin-tanka l-flex-row c-meta-info-marker">' + 
            `<span class="c-sentence c-forth-sentence">${forthSentence}</span>` + 
            `<span class="c-sentence c-fifth-sentence">${fifthSentence}</span>` + 
            '</p>' + 
            `<span class="c-meta-info u-yu-16-regular-text u-color-white">${writer}『${works}』</span>` + 
            '</div>' + 
            '</div>'
        );

        imgDisplayStage.insertAdjacentHTML(
            'beforeend',
            '<div class="p-img-display-stage next">' + 
            '<div class="p-img-no-display-area"></div>' +
            '<div class="p-img-fadein-area"></div>' + 
            '<div class="p-img-display-area"></div>' + 
            '<div class="p-img-fadeout-area"></div>' + 
            '</div>'
        );

        tankaDisplayStage.insertAdjacentHTML(
            'beforeend',
            '<div class="p-tanka-display-stage next">' + 
            '<div class="p-tanka-no-display-area-1"></div>' +
            '<div class="p-tanka-fadein-area"></div>' + 
            '<div class="p-tanka-display-area"></div>' + 
            '<div class="p-tanka-fadeout-area"></div>' + 
            '<div class="p-tanka-no-display-area-2"></div>' + 
            '</div>'
        );

        tankaArray.push($(".c-tanka:last")[0]);
        imgArray.push($(".c-tanka-img:last")[0]);

        transparentRateArray.push(getTransparentRate());

        scaleArray.push(getscale());
        sentenceArray.push(getSentence());
    };

    // zip関数作成
    const zip_2 = (
        array1, 
        array2, 
    ) => array1.map((_, i) => [
        array1[i], 
        array2[i], 
    ]);

    const zip_3 = (
        array1, 
        array2, 
        array3, 
    ) => array1.map((_, i) => [
        array1[i], 
        array2[i], 
        array3[i], 
    ]);

    const zip_5 = (
        array1, 
        array2, 
        array3, 
        array4, 
        array5
    ) => array1.map((_, i) => [
        array1[i], 
        array2[i], 
        array3[i], 
        array4[i], 
        array5[i]
    ]);

    //スクロール量の反映関数
    function reflectScroll(first, current, criteria, rate) {
        return first + (current - criteria) * rate;
    }

    // トップのフェードアウト
    const scaleTopFadeout = $('.p-top-fadeout-area').offset().top;
    const scaleTopNodisplay = scaleTopFadeout + $('.p-top-fadeout-area').height();
    const topFadeoutRate = -1 / $('.p-top-fadeout-area').height();
    const mainVisual = $('.l-mainvisual')[0];

    function displayTankaAndImage(tankaArray, imgArray, scaleArray, transparentRateArray, sentenceArray) {
        let transparent;
        let current = $(window).scrollTop(); //スクロールした距離を取得
        let rotate;
        let translateX;
        let translateY;

        if (current < scaleTopFadeout) {
            mainVisual.classList.remove('none');
        } else if (current <scaleTopNodisplay) { 
            transparent = reflectScroll(1, current, scaleTopFadeout, topFadeoutRate);
            mainVisual.style.opacity = transparent;
        } else {
            mainVisual.classList.add('none');
        }
    
        // 短歌、画像のフェードイン、フェードアウト
        zip_5(tankaArray, imgArray, scaleArray, transparentRateArray, sentenceArray).forEach(
            ([tanka, img, scale, transparentRate, sentence]) => {
                //短歌
                if (current < scale.tankaFadein) { //スクロール距離 < フェードイン開始位置
                    tanka.classList.add('none'); //class『none』を追加
                } else if (current < scale.tankaFadeout) { //フェードイン開始位置 =< スクロール距離 < フェードアウト開始位置
                    transparent = reflectScroll(0, current, scale.tankaFadein, transparentRate.tankaFadein);
                    tanka.classList.remove('none'); //class『none』を削除
                    tanka.style.opacity = transparent;
                } else if (current < scale.tankaNodisplay) { //スクロール距離 > フェードアウト開始位置
                    // 透明度の調節
                    transparent = reflectScroll(1, current, scale.tankaFadeout, transparentRate.tankaFadeout);
                    tanka.style.opacity = transparent;
    
                    let positionCssScriptArray = [];
    
                    zip_3(translateXRateArray, translateYRateArray, rotateRateArray).forEach(
                        ([translateXRate, translateYRate, rotateRate]) => {
                            translateX = reflectScroll(0, current, scale.tankaFadeout, translateXRate);
                            translateY = reflectScroll(0, current, scale.tankaFadeout, translateYRate);
                            rotate = reflectScroll(0, current, scale.tankaFadeout, rotateRate);
    
                            let positionCssScript = {
                                translateX: translateX, 
                                translateY: translateY, 
                                rotate: rotate, 
                            }
                            positionCssScriptArray.push(positionCssScript);
                        }
                    )
    
                    zip_2(sentence, positionCssScriptArray).forEach(
                        ([s, positionCssScript]) => {
                            s.style.transform = 'rotate(' + positionCssScript.rotate + 'deg' + ')' + ' ' + 'translate(' + positionCssScript.translateX + 'vw,' + positionCssScript.translateY + 'vh' + ')';
                        }
                    )
                } else {
                    tanka.classList.add('none'); //class『none』を追加
                }
    
                //画像
                if (current < scale.imgFadein) { //スクロール距離 < フェードイン開始位置
                    img.classList.add('none'); //class『none』を追加
                } else if (current < scale.imgFadeout) { //フェードイン開始位置 =< スクロール距離 < フェードアウト開始位置
                    transparent = reflectScroll(0, current, scale.imgFadein, transparentRate.imgFadein);
                    img.classList.remove('none'); //class『none』を削除
                    img.style.opacity = transparent;
                } else if (current < scale.imgNodisplay) { //スクロール距離 > フェードアウト開始位置
                    transparent = reflectScroll(1, current, scale.imgFadeout, transparentRate.imgFadeout);
                    img.style.opacity = transparent;
                } else {
                    img.classList.add('none'); //class『none』を追加
                }
            }
        )    
    }
    $(document).scroll(function(){
        displayTankaAndImage(tankaArray, imgArray, scaleArray, transparentRateArray, sentenceArray);
    });      
});