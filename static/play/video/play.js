function initVideo(param) {
    var videoObj = videojs(param.id, {
        sources: [
            {
                src: param.url,
                type: 'application/x-mpegURL'
            }
        ],
        width: param.width || '100%',
        height: param.height || '100%',
        controls: true,
        autoplay: false,
      
        flash: {
            swf: './video-js.swf'
        },
        techOrder: ['html5', 'flash']
    }),
        videoH5Id = '#' + param.id + '_html5_api';

    if (param.ad && param.ad.pre && param.ad.pre.url) {
        videoObj.ads({ timeout: 10000 });
        var preAD = {
            preAdLink: function () {
                window.open(param.ad.pre.link);
                videoObj.pause();
            },
            adCover: videojs.dom.createEl('div', { style: "position:absolute;bottom:3em;left:0;width:100%;height:100%;z-index: 999" }),
            skip: param.mobileOn ? videojs.dom.createEl('div', { style: "cursor: pointer;text-align: center;position:absolute;;bottom:-2rem;left:0;width:100%;height:2rem;line-height: 2rem;font-size: 0.9rem;background:rgba(43,51,63,.7);z-index: 999999999999999" }, { class: 'skip' }, '点击跳过广告') : videojs.dom.createEl('div', { style: "font-size: 0.9rem;cursor: pointer;position:absolute;top:10px;right:10px;padding:10px 20px;border:solid 1px #fff;z-index: 9999;background:rgba(43,51,63,.7)" }, { class: 'skip' }, '点击跳过广告'),
            closeAD: null
        }
        videoObj.on('readyforpreroll', function () {
            videoObj.ads.startLinearAdMode();
            videoObj.src(param.ad.pre.url);
            videoObj.one('adplaying', function () {
                clearTimeout(preAD.closeAD);
                videoObj.trigger('ads-ad-started');
                if (videojs.dom.$(videoH5Id)) {
                    videoObj.on(videojs.dom.$(videoH5Id), 'click', preAD.preAdLink);
                    if (param.mobileOn) {
                        videojs.dom.$(videoH5Id).addEventListener('touchend', preAD.preAdLink);
                    }
                }
                videojs.dom.appendContent(videoObj.el_, preAD.adCover);
                videojs.dom.appendContent(videoObj.el_, preAD.skip);
                if (param.mobileOn) {
                    videoObj.el_.parentNode.style.paddingBottom = '2rem';
                }
                videoObj.on(preAD.adCover, 'click', preAD.preAdLink);
                videoObj.on(preAD.skip, 'click', function () {
                    videoObj.ads.endLinearAdMode();
                    preAD.preAdLink();
                    videoObj.el_.removeChild(preAD.skip);
                    videoObj.el_.removeChild(preAD.adCover);
                    if (param.mobileOn) {
                        videoObj.el_.parentNode.style.paddingBottom = '0';
                    }
                    if (param.mobileOn) {
                        videojs.dom.$(videoH5Id).removeEventListener('touchend', preAD.preAdLink);
                    }
                });
            });
            videoObj.one('adended', function () {
                videoObj.ads.endLinearAdMode();
                if (videojs.dom.$(videoH5Id)) {
                    videoObj.off(videojs.dom.$(videoH5Id), 'click', preAD.preAdLink);
                    if (param.mobileOn) {
                        videojs.dom.$(videoH5Id).removeEventListener('touchend', preAD.preAdLink);
                    }
                }
                videoObj.el_.removeChild(preAD.adCover);
                videoObj.el_.removeChild(preAD.skip);
                videoObj.el_.parentNode.style.paddingBottom = '0';
            });
        });
        videoObj.trigger('adsready');
        preAD.closeAD = setTimeout(function () {
            videoObj.ads.endLinearAdMode();
        }, 15000);
    }
    var ua = navigator.userAgent.toLocaleLowerCase();
    if (param.ad && param.ad.pause && param.ad.pause.url && !(ua.indexOf('sogou') > -1 && ua.indexOf('mobile') > -1)) {
        var pauAD = {
            adCover: videojs.dom.createEl('a', {
                style: "position:absolute;bottom:3em;left:0;top:3em;right:0;text-align:center;",
                href: param.ad.pause.link ? param.ad.pause.link : 'javascript:void(0);',
            }, { class: "pasuAD", target: "_blank" },
                videojs.dom.createEl('img', { style: "max-width:100%; max-height:100%;", src: param.ad.pause.url })
            ),
            manual: false
        }

        videoObj.on('pause', function () {
            if (param.mobileOn) {
                videojs.dom.$(videoH5Id).style.left = '-100%';
            }
            videojs.dom.appendContent(videoObj.el_, pauAD.adCover);
        })
        videoObj.on('play', function () {
            if (param.mobileOn) {
                videojs.dom.$(videoH5Id).style.left = '0';
            }
            if (videojs.dom.$('.pasuAD')) {
                videoObj.el_.removeChild(pauAD.adCover);
            }
        })
    }
        if(param.logo&&param.logo.url){
        var logo={
            dom:videojs.dom.createEl('img', {
                style: 'position:absolute;top:1em;right:1em;z-index:10;width:'+param.logo.width,
                src:param.logo.url
            })
        }
        videojs.dom.appendContent(videoObj.el_, logo.dom);
    }
    //videoObj.play();
    return videoObj;
};