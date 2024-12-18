!(function (t) {
  "function" == typeof define && define.amd
    ? define(["jquery"], t)
    : "object" == typeof module && module.exports
    ? (module.exports = t(require("jquery")))
    : t(jQuery);
})(function (t) {
  t.extend(t.fn, {
    validate: function (e) {
      if (!this.length)
        return void (
          e &&
          e.debug &&
          window.console &&
          console.warn("Nothing selected, can't validate, returning nothing.")
        );
      var i = t.data(this[0], "validator");
      return i
        ? i
        : (this.attr("novalidate", "novalidate"),
          (i = new t.validator(e, this[0])),
          t.data(this[0], "validator", i),
          i.settings.onsubmit &&
            (this.on("click.validate", ":submit", function (e) {
              i.settings.submitHandler && (i.submitButton = e.target),
                t(this).hasClass("cancel") && (i.cancelSubmit = !0),
                void 0 !== t(this).attr("formnovalidate") &&
                  (i.cancelSubmit = !0);
            }),
            this.on("submit.validate", function (e) {
              function s() {
                var s, r;
                return i.settings.submitHandler
                  ? (i.submitButton &&
                      (s = t("<input type='hidden'/>")
                        .attr("name", i.submitButton.name)
                        .val(t(i.submitButton).val())
                        .appendTo(i.currentForm)),
                    (r = i.settings.submitHandler.call(i, i.currentForm, e)),
                    i.submitButton && s.remove(),
                    void 0 !== r ? r : !1)
                  : !0;
              }
              return (
                i.settings.debug && e.preventDefault(),
                i.cancelSubmit
                  ? ((i.cancelSubmit = !1), s())
                  : i.form()
                  ? i.pendingRequest
                    ? ((i.formSubmitted = !0), !1)
                    : s()
                  : (i.focusInvalid(), !1)
              );
            })),
          i);
    },
    valid: function () {
      var e, i, s;
      return (
        t(this[0]).is("form")
          ? (e = this.validate().form())
          : ((s = []),
            (e = !0),
            (i = t(this[0].form).validate()),
            this.each(function () {
              (e = i.element(this) && e), e || (s = s.concat(i.errorList));
            }),
            (i.errorList = s)),
        e
      );
    },
    rules: function (e, i) {
      if (this.length) {
        var s,
          r,
          n,
          a,
          o,
          l,
          h = this[0];
        if (e)
          switch (
            ((s = t.data(h.form, "validator").settings),
            (r = s.rules),
            (n = t.validator.staticRules(h)),
            e)
          ) {
            case "add":
              t.extend(n, t.validator.normalizeRule(i)),
                delete n.messages,
                (r[h.name] = n),
                i.messages &&
                  (s.messages[h.name] = t.extend(
                    s.messages[h.name],
                    i.messages
                  ));
              break;
            case "remove":
              return i
                ? ((l = {}),
                  t.each(i.split(/\s/), function (e, i) {
                    (l[i] = n[i]),
                      delete n[i],
                      "required" === i && t(h).removeAttr("aria-required");
                  }),
                  l)
                : (delete r[h.name], n);
          }
        return (
          (a = t.validator.normalizeRules(
            t.extend(
              {},
              t.validator.classRules(h),
              t.validator.attributeRules(h),
              t.validator.dataRules(h),
              t.validator.staticRules(h)
            ),
            h
          )),
          a.required &&
            ((o = a.required),
            delete a.required,
            (a = t.extend({ required: o }, a)),
            t(h).attr("aria-required", "true")),
          a.remote &&
            ((o = a.remote), delete a.remote, (a = t.extend(a, { remote: o }))),
          a
        );
      }
    },
  }),
    t.extend(t.expr[":"], {
      blank: function (e) {
        return !t.trim("" + t(e).val());
      },
      filled: function (e) {
        var i = t(e).val();
        return null !== i && !!t.trim("" + i);
      },
      unchecked: function (e) {
        return !t(e).prop("checked");
      },
    }),
    (t.validator = function (e, i) {
      (this.settings = t.extend(!0, {}, t.validator.defaults, e)),
        (this.currentForm = i),
        this.init();
    }),
    (t.validator.format = function (e, i) {
      return 1 === arguments.length
        ? function () {
            var i = t.makeArray(arguments);
            return i.unshift(e), t.validator.format.apply(this, i);
          }
        : void 0 === i
        ? e
        : (arguments.length > 2 &&
            i.constructor !== Array &&
            (i = t.makeArray(arguments).slice(1)),
          i.constructor !== Array && (i = [i]),
          t.each(i, function (t, i) {
            e = e.replace(new RegExp("\\{" + t + "\\}", "g"), function () {
              return i;
            });
          }),
          e);
    }),
    t.extend(t.validator, {
      defaults: {
        messages: {},
        groups: {},
        rules: {},
        errorClass: "error",
        pendingClass: "pending",
        validClass: "valid",
        errorElement: "label",
        focusCleanup: !1,
        focusInvalid: !0,
        errorContainer: t([]),
        errorLabelContainer: t([]),
        onsubmit: !0,
        ignore: ":hidden",
        ignoreTitle: !1,
        onfocusin: function (t) {
          (this.lastActive = t),
            this.settings.focusCleanup &&
              (this.settings.unhighlight &&
                this.settings.unhighlight.call(
                  this,
                  t,
                  this.settings.errorClass,
                  this.settings.validClass
                ),
              this.hideThese(this.errorsFor(t)));
        },
        onfocusout: function (t) {
          this.checkable(t) ||
            (!(t.name in this.submitted) && this.optional(t)) ||
            this.element(t);
        },
        onkeyup: function (e, i) {
          var s = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];
          (9 === i.which && "" === this.elementValue(e)) ||
            -1 !== t.inArray(i.keyCode, s) ||
            ((e.name in this.submitted || e.name in this.invalid) &&
              this.element(e));
        },
        onclick: function (t) {
          t.name in this.submitted
            ? this.element(t)
            : t.parentNode.name in this.submitted && this.element(t.parentNode);
        },
        highlight: function (e, i, s) {
          "radio" === e.type
            ? this.findByName(e.name).addClass(i).removeClass(s)
            : t(e).addClass(i).removeClass(s);
        },
        unhighlight: function (e, i, s) {
          "radio" === e.type
            ? this.findByName(e.name).removeClass(i).addClass(s)
            : t(e).removeClass(i).addClass(s);
        },
      },
      setDefaults: function (e) {
        t.extend(t.validator.defaults, e);
      },
      messages: {
        required: "This field is required.",
        remote: "Please fix this field.",
        email: "Please enter a valid email address.",
        url: "Please enter a valid URL.",
        date: "Please enter a valid date.",
        dateISO: "Please enter a valid date ( ISO ).",
        number: "Please enter a valid number.",
        digits: "Please enter only digits.",
        equalTo: "Please enter the same value again.",
        maxlength: t.validator.format(
          "Please enter no more than {0} characters."
        ),
        minlength: t.validator.format("Please enter at least {0} characters."),
        rangelength: t.validator.format(
          "Please enter a value between {0} and {1} characters long."
        ),
        range: t.validator.format("Please enter a value between {0} and {1}."),
        max: t.validator.format(
          "Please enter a value less than or equal to {0}."
        ),
        min: t.validator.format(
          "Please enter a value greater than or equal to {0}."
        ),
        step: t.validator.format("Please enter a multiple of {0}."),
      },
      autoCreateRanges: !1,
      prototype: {
        init: function () {
          function e(e) {
            var i = t.data(this.form, "validator"),
              s = "on" + e.type.replace(/^validate/, ""),
              r = i.settings;
            r[s] && !t(this).is(r.ignore) && r[s].call(i, this, e);
          }
          (this.labelContainer = t(this.settings.errorLabelContainer)),
            (this.errorContext =
              (this.labelContainer.length && this.labelContainer) ||
              t(this.currentForm)),
            (this.containers = t(this.settings.errorContainer).add(
              this.settings.errorLabelContainer
            )),
            (this.submitted = {}),
            (this.valueCache = {}),
            (this.pendingRequest = 0),
            (this.pending = {}),
            (this.invalid = {}),
            this.reset();
          var i,
            s = (this.groups = {});
          t.each(this.settings.groups, function (e, i) {
            "string" == typeof i && (i = i.split(/\s/)),
              t.each(i, function (t, i) {
                s[i] = e;
              });
          }),
            (i = this.settings.rules),
            t.each(i, function (e, s) {
              i[e] = t.validator.normalizeRule(s);
            }),
            t(this.currentForm)
              .on(
                "focusin.validate focusout.validate keyup.validate",
                ":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], [type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], [type='radio'], [type='checkbox'], [contenteditable]",
                e
              )
              .on(
                "click.validate",
                "select, option, [type='radio'], [type='checkbox']",
                e
              ),
            this.settings.invalidHandler &&
              t(this.currentForm).on(
                "invalid-form.validate",
                this.settings.invalidHandler
              ),
            t(this.currentForm)
              .find("[required], [data-rule-required], .required")
              .attr("aria-required", "true");
        },
        form: function () {
          return (
            this.checkForm(),
            t.extend(this.submitted, this.errorMap),
            (this.invalid = t.extend({}, this.errorMap)),
            this.valid() ||
              t(this.currentForm).triggerHandler("invalid-form", [this]),
            this.showErrors(),
            this.valid()
          );
        },
        checkForm: function () {
          this.prepareForm();
          for (
            var t = 0, e = (this.currentElements = this.elements());
            e[t];
            t++
          )
            this.check(e[t]);
          return this.valid();
        },
        element: function (e) {
          var i,
            s,
            r = this.clean(e),
            n = this.validationTargetFor(r),
            a = this,
            o = !0;
          return (
            void 0 === n
              ? delete this.invalid[r.name]
              : (this.prepareElement(n),
                (this.currentElements = t(n)),
                (s = this.groups[n.name]),
                s &&
                  t.each(this.groups, function (t, e) {
                    e === s &&
                      t !== n.name &&
                      ((r = a.validationTargetFor(a.clean(a.findByName(t)))),
                      r &&
                        r.name in a.invalid &&
                        (a.currentElements.push(r), (o = o && a.check(r))));
                  }),
                (i = this.check(n) !== !1),
                (o = o && i),
                i ? (this.invalid[n.name] = !1) : (this.invalid[n.name] = !0),
                this.numberOfInvalids() ||
                  (this.toHide = this.toHide.add(this.containers)),
                this.showErrors(),
                t(e).attr("aria-invalid", !i)),
            o
          );
        },
        showErrors: function (e) {
          if (e) {
            var i = this;
            t.extend(this.errorMap, e),
              (this.errorList = t.map(this.errorMap, function (t, e) {
                return { message: t, element: i.findByName(e)[0] };
              })),
              (this.successList = t.grep(this.successList, function (t) {
                return !(t.name in e);
              }));
          }
          this.settings.showErrors
            ? this.settings.showErrors.call(this, this.errorMap, this.errorList)
            : this.defaultShowErrors();
        },
        resetForm: function () {
          t.fn.resetForm && t(this.currentForm).resetForm(),
            (this.invalid = {}),
            (this.submitted = {}),
            this.prepareForm(),
            this.hideErrors();
          var e = this.elements()
            .removeData("previousValue")
            .removeAttr("aria-invalid");
          this.resetElements(e);
        },
        resetElements: function (t) {
          var e;
          if (this.settings.unhighlight)
            for (e = 0; t[e]; e++)
              this.settings.unhighlight.call(
                this,
                t[e],
                this.settings.errorClass,
                ""
              ),
                this.findByName(t[e].name).removeClass(
                  this.settings.validClass
                );
          else
            t.removeClass(this.settings.errorClass).removeClass(
              this.settings.validClass
            );
        },
        numberOfInvalids: function () {
          return this.objectLength(this.invalid);
        },
        objectLength: function (t) {
          var e,
            i = 0;
          for (e in t) t[e] && i++;
          return i;
        },
        hideErrors: function () {
          this.hideThese(this.toHide);
        },
        hideThese: function (t) {
          t.not(this.containers).text(""), this.addWrapper(t).hide();
        },
        valid: function () {
          return 0 === this.size();
        },
        size: function () {
          return this.errorList.length;
        },
        focusInvalid: function () {
          if (this.settings.focusInvalid)
            try {
              t(
                this.findLastActive() ||
                  (this.errorList.length && this.errorList[0].element) ||
                  []
              )
                .filter(":visible")
                .focus()
                .trigger("focusin");
            } catch (e) {}
        },
        findLastActive: function () {
          var e = this.lastActive;
          return (
            e &&
            1 ===
              t.grep(this.errorList, function (t) {
                return t.element.name === e.name;
              }).length &&
            e
          );
        },
        elements: function () {
          var e = this,
            i = {};
          return t(this.currentForm)
            .find("input, select, textarea, [contenteditable]")
            .not(":submit, :reset, :image, :disabled")
            .not(this.settings.ignore)
            .filter(function () {
              var s = this.name || t(this).attr("name");
              return (
                !s &&
                  e.settings.debug &&
                  window.console &&
                  console.error("%o has no name assigned", this),
                this.hasAttribute("contenteditable") &&
                  (this.form = t(this).closest("form")[0]),
                s in i || !e.objectLength(t(this).rules())
                  ? !1
                  : ((i[s] = !0), !0)
              );
            });
        },
        clean: function (e) {
          return t(e)[0];
        },
        errors: function () {
          var e = this.settings.errorClass.split(" ").join(".");
          return t(this.settings.errorElement + "." + e, this.errorContext);
        },
        resetInternals: function () {
          (this.successList = []),
            (this.errorList = []),
            (this.errorMap = {}),
            (this.toShow = t([])),
            (this.toHide = t([]));
        },
        reset: function () {
          this.resetInternals(), (this.currentElements = t([]));
        },
        prepareForm: function () {
          this.reset(), (this.toHide = this.errors().add(this.containers));
        },
        prepareElement: function (t) {
          this.reset(), (this.toHide = this.errorsFor(t));
        },
        elementValue: function (e) {
          var i,
            s,
            r = t(e),
            n = e.type;
          return "radio" === n || "checkbox" === n
            ? this.findByName(e.name).filter(":checked").val()
            : "number" === n && "undefined" != typeof e.validity
            ? e.validity.badInput
              ? "NaN"
              : r.val()
            : ((i = e.hasAttribute("contenteditable") ? r.text() : r.val()),
              "file" === n
                ? "C:\\fakepath\\" === i.substr(0, 12)
                  ? i.substr(12)
                  : ((s = i.lastIndexOf("/")),
                    s >= 0
                      ? i.substr(s + 1)
                      : ((s = i.lastIndexOf("\\")),
                        s >= 0 ? i.substr(s + 1) : i))
                : "string" == typeof i
                ? i.replace(/\r/g, "")
                : i);
        },
        check: function (e) {
          e = this.validationTargetFor(this.clean(e));
          var i,
            s,
            r,
            n = t(e).rules(),
            a = t.map(n, function (t, e) {
              return e;
            }).length,
            o = !1,
            l = this.elementValue(e);
          if ("function" == typeof n.normalizer) {
            if (((l = n.normalizer.call(e, l)), "string" != typeof l))
              throw new TypeError(
                "The normalizer should return a string value."
              );
            delete n.normalizer;
          }
          for (s in n) {
            r = { method: s, parameters: n[s] };
            try {
              if (
                ((i = t.validator.methods[s].call(this, l, e, r.parameters)),
                "dependency-mismatch" === i && 1 === a)
              ) {
                o = !0;
                continue;
              }
              if (((o = !1), "pending" === i))
                return void (this.toHide = this.toHide.not(this.errorsFor(e)));
              if (!i) return this.formatAndAdd(e, r), !1;
            } catch (h) {
              throw (
                (this.settings.debug &&
                  window.console &&
                  console.log(
                    "Exception occurred when checking element " +
                      e.id +
                      ", check the '" +
                      r.method +
                      "' method.",
                    h
                  ),
                h instanceof TypeError &&
                  (h.message +=
                    ".  Exception occurred when checking element " +
                    e.id +
                    ", check the '" +
                    r.method +
                    "' method."),
                h)
              );
            }
          }
          if (!o) return this.objectLength(n) && this.successList.push(e), !0;
        },
        customDataMessage: function (e, i) {
          return (
            t(e).data(
              "msg" + i.charAt(0).toUpperCase() + i.substring(1).toLowerCase()
            ) || t(e).data("msg")
          );
        },
        customMessage: function (t, e) {
          var i = this.settings.messages[t];
          return i && (i.constructor === String ? i : i[e]);
        },
        findDefined: function () {
          for (var t = 0; t < arguments.length; t++)
            if (void 0 !== arguments[t]) return arguments[t];
        },
        defaultMessage: function (e, i) {
          var s = this.findDefined(
              this.customMessage(e.name, i.method),
              this.customDataMessage(e, i.method),
              (!this.settings.ignoreTitle && e.title) || void 0,
              t.validator.messages[i.method],
              "<strong>Warning: No message defined for " + e.name + "</strong>"
            ),
            r = /\$?\{(\d+)\}/g;
          return (
            "function" == typeof s
              ? (s = s.call(this, i.parameters, e))
              : r.test(s) &&
                (s = t.validator.format(s.replace(r, "{$1}"), i.parameters)),
            s
          );
        },
        formatAndAdd: function (t, e) {
          var i = this.defaultMessage(t, e);
          this.errorList.push({ message: i, element: t, method: e.method }),
            (this.errorMap[t.name] = i),
            (this.submitted[t.name] = i);
        },
        addWrapper: function (t) {
          return (
            this.settings.wrapper &&
              (t = t.add(t.parent(this.settings.wrapper))),
            t
          );
        },
        defaultShowErrors: function () {
          var t, e, i;
          for (t = 0; this.errorList[t]; t++)
            (i = this.errorList[t]),
              this.settings.highlight &&
                this.settings.highlight.call(
                  this,
                  i.element,
                  this.settings.errorClass,
                  this.settings.validClass
                ),
              this.showLabel(i.element, i.message);
          if (
            (this.errorList.length &&
              (this.toShow = this.toShow.add(this.containers)),
            this.settings.success)
          )
            for (t = 0; this.successList[t]; t++)
              this.showLabel(this.successList[t]);
          if (this.settings.unhighlight)
            for (t = 0, e = this.validElements(); e[t]; t++)
              this.settings.unhighlight.call(
                this,
                e[t],
                this.settings.errorClass,
                this.settings.validClass
              );
          (this.toHide = this.toHide.not(this.toShow)),
            this.hideErrors(),
            this.addWrapper(this.toShow).show();
        },
        validElements: function () {
          return this.currentElements.not(this.invalidElements());
        },
        invalidElements: function () {
          return t(this.errorList).map(function () {
            return this.element;
          });
        },
        showLabel: function (e, i) {
          var s,
            r,
            n,
            a,
            o = this.errorsFor(e),
            l = this.idOrName(e),
            h = t(e).attr("aria-describedby");
          o.length
            ? (o
                .removeClass(this.settings.validClass)
                .addClass(this.settings.errorClass),
              o.html(i))
            : ((o = t("<" + this.settings.errorElement + ">")
                .attr("id", l + "-error")
                .addClass(this.settings.errorClass)
                .html(i || "")),
              (s = o),
              this.settings.wrapper &&
                (s = o
                  .hide()
                  .show()
                  .wrap("<" + this.settings.wrapper + "/>")
                  .parent()),
              this.labelContainer.length
                ? this.labelContainer.append(s)
                : this.settings.errorPlacement
                ? this.settings.errorPlacement(s, t(e))
                : s.insertAfter(e),
              o.is("label")
                ? o.attr("for", l)
                : 0 ===
                    o.parents("label[for='" + this.escapeCssMeta(l) + "']")
                      .length &&
                  ((n = o.attr("id")),
                  h
                    ? h.match(
                        new RegExp("\\b" + this.escapeCssMeta(n) + "\\b")
                      ) || (h += " " + n)
                    : (h = n),
                  t(e).attr("aria-describedby", h),
                  (r = this.groups[e.name]),
                  r &&
                    ((a = this),
                    t.each(a.groups, function (e, i) {
                      i === r &&
                        t(
                          "[name='" + a.escapeCssMeta(e) + "']",
                          a.currentForm
                        ).attr("aria-describedby", o.attr("id"));
                    })))),
            !i &&
              this.settings.success &&
              (o.text(""),
              "string" == typeof this.settings.success
                ? o.addClass(this.settings.success)
                : this.settings.success(o, e)),
            (this.toShow = this.toShow.add(o));
        },
        errorsFor: function (e) {
          var i = this.escapeCssMeta(this.idOrName(e)),
            s = t(e).attr("aria-describedby"),
            r = "label[for='" + i + "'], label[for='" + i + "'] *";
          return (
            s && (r = r + ", #" + this.escapeCssMeta(s).replace(/\s+/g, ", #")),
            this.errors().filter(r)
          );
        },
        escapeCssMeta: function (t) {
          return t.replace(/([\\!"#$%&'()*+,.\/:;<=>?@\[\]^`{|}~])/g, "\\$1");
        },
        idOrName: function (t) {
          return (
            this.groups[t.name] || (this.checkable(t) ? t.name : t.id || t.name)
          );
        },
        validationTargetFor: function (e) {
          return (
            this.checkable(e) && (e = this.findByName(e.name)),
            t(e).not(this.settings.ignore)[0]
          );
        },
        checkable: function (t) {
          return /radio|checkbox/i.test(t.type);
        },
        findByName: function (e) {
          return t(this.currentForm).find(
            "[name='" + this.escapeCssMeta(e) + "']"
          );
        },
        getLength: function (e, i) {
          switch (i.nodeName.toLowerCase()) {
            case "select":
              return t("option:selected", i).length;
            case "input":
              if (this.checkable(i))
                return this.findByName(i.name).filter(":checked").length;
          }
          return e.length;
        },
        depend: function (t, e) {
          return this.dependTypes[typeof t]
            ? this.dependTypes[typeof t](t, e)
            : !0;
        },
        dependTypes: {
          boolean: function (t) {
            return t;
          },
          string: function (e, i) {
            return !!t(e, i.form).length;
          },
          function: function (t, e) {
            return t(e);
          },
        },
        optional: function (e) {
          var i = this.elementValue(e);
          return (
            !t.validator.methods.required.call(this, i, e) &&
            "dependency-mismatch"
          );
        },
        startRequest: function (e) {
          this.pending[e.name] ||
            (this.pendingRequest++,
            t(e).addClass(this.settings.pendingClass),
            (this.pending[e.name] = !0));
        },
        stopRequest: function (e, i) {
          this.pendingRequest--,
            this.pendingRequest < 0 && (this.pendingRequest = 0),
            delete this.pending[e.name],
            t(e).removeClass(this.settings.pendingClass),
            i && 0 === this.pendingRequest && this.formSubmitted && this.form()
              ? (t(this.currentForm).submit(), (this.formSubmitted = !1))
              : !i &&
                0 === this.pendingRequest &&
                this.formSubmitted &&
                (t(this.currentForm).triggerHandler("invalid-form", [this]),
                (this.formSubmitted = !1));
        },
        previousValue: function (e, i) {
          return (
            t.data(e, "previousValue") ||
            t.data(e, "previousValue", {
              old: null,
              valid: !0,
              message: this.defaultMessage(e, { method: i }),
            })
          );
        },
        destroy: function () {
          this.resetForm(),
            t(this.currentForm)
              .off(".validate")
              .removeData("validator")
              .find(".validate-equalTo-blur")
              .off(".validate-equalTo")
              .removeClass("validate-equalTo-blur");
        },
      },
      classRuleSettings: {
        required: { required: !0 },
        email: { email: !0 },
        url: { url: !0 },
        date: { date: !0 },
        dateISO: { dateISO: !0 },
        number: { number: !0 },
        digits: { digits: !0 },
        creditcard: { creditcard: !0 },
      },
      addClassRules: function (e, i) {
        e.constructor === String
          ? (this.classRuleSettings[e] = i)
          : t.extend(this.classRuleSettings, e);
      },
      classRules: function (e) {
        var i = {},
          s = t(e).attr("class");
        return (
          s &&
            t.each(s.split(" "), function () {
              this in t.validator.classRuleSettings &&
                t.extend(i, t.validator.classRuleSettings[this]);
            }),
          i
        );
      },
      normalizeAttributeRule: function (t, e, i, s) {
        /min|max|step/.test(i) &&
          (null === e || /number|range|text/.test(e)) &&
          ((s = Number(s)), isNaN(s) && (s = void 0)),
          s || 0 === s ? (t[i] = s) : e === i && "range" !== e && (t[i] = !0);
      },
      attributeRules: function (e) {
        var i,
          s,
          r = {},
          n = t(e),
          a = e.getAttribute("type");
        for (i in t.validator.methods)
          "required" === i
            ? ((s = e.getAttribute(i)), "" === s && (s = !0), (s = !!s))
            : (s = n.attr(i)),
            this.normalizeAttributeRule(r, a, i, s);
        return (
          r.maxlength &&
            /-1|2147483647|524288/.test(r.maxlength) &&
            delete r.maxlength,
          r
        );
      },
      dataRules: function (e) {
        var i,
          s,
          r = {},
          n = t(e),
          a = e.getAttribute("type");
        for (i in t.validator.methods)
          (s = n.data(
            "rule" + i.charAt(0).toUpperCase() + i.substring(1).toLowerCase()
          )),
            this.normalizeAttributeRule(r, a, i, s);
        return r;
      },
      staticRules: function (e) {
        var i = {},
          s = t.data(e.form, "validator");
        return (
          s.settings.rules &&
            (i = t.validator.normalizeRule(s.settings.rules[e.name]) || {}),
          i
        );
      },
      normalizeRules: function (e, i) {
        return (
          t.each(e, function (s, r) {
            if (r === !1) return void delete e[s];
            if (r.param || r.depends) {
              var n = !0;
              switch (typeof r.depends) {
                case "string":
                  n = !!t(r.depends, i.form).length;
                  break;
                case "function":
                  n = r.depends.call(i, i);
              }
              n
                ? (e[s] = void 0 !== r.param ? r.param : !0)
                : (t.data(i.form, "validator").resetElements(t(i)),
                  delete e[s]);
            }
          }),
          t.each(e, function (s, r) {
            e[s] = t.isFunction(r) && "normalizer" !== s ? r(i) : r;
          }),
          t.each(["minlength", "maxlength"], function () {
            e[this] && (e[this] = Number(e[this]));
          }),
          t.each(["rangelength", "range"], function () {
            var i;
            e[this] &&
              (t.isArray(e[this])
                ? (e[this] = [Number(e[this][0]), Number(e[this][1])])
                : "string" == typeof e[this] &&
                  ((i = e[this].replace(/[\[\]]/g, "").split(/[\s,]+/)),
                  (e[this] = [Number(i[0]), Number(i[1])])));
          }),
          t.validator.autoCreateRanges &&
            (null != e.min &&
              null != e.max &&
              ((e.range = [e.min, e.max]), delete e.min, delete e.max),
            null != e.minlength &&
              null != e.maxlength &&
              ((e.rangelength = [e.minlength, e.maxlength]),
              delete e.minlength,
              delete e.maxlength)),
          e
        );
      },
      normalizeRule: function (e) {
        if ("string" == typeof e) {
          var i = {};
          t.each(e.split(/\s/), function () {
            i[this] = !0;
          }),
            (e = i);
        }
        return e;
      },
      addMethod: function (e, i, s) {
        (t.validator.methods[e] = i),
          (t.validator.messages[e] =
            void 0 !== s ? s : t.validator.messages[e]),
          i.length < 3 &&
            t.validator.addClassRules(e, t.validator.normalizeRule(e));
      },
      methods: {
        required: function (e, i, s) {
          if (!this.depend(s, i)) return "dependency-mismatch";
          if ("select" === i.nodeName.toLowerCase()) {
            var r = t(i).val();
            return r && r.length > 0;
          }
          return this.checkable(i) ? this.getLength(e, i) > 0 : e.length > 0;
        },
        email: function (t, e) {
          return (
            this.optional(e) ||
            /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
              t
            )
          );
        },
        url: function (t, e) {
          return (
            this.optional(e) ||
            /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[\/?#]\S*)?$/i.test(
              t
            )
          );
        },
        date: function (t, e) {
          return (
            this.optional(e) || !/Invalid|NaN/.test(new Date(t).toString())
          );
        },
        dateISO: function (t, e) {
          return (
            this.optional(e) ||
            /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(
              t
            )
          );
        },
        number: function (t, e) {
          return (
            this.optional(e) ||
            /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(t)
          );
        },
        digits: function (t, e) {
          return this.optional(e) || /^\d+$/.test(t);
        },
        minlength: function (e, i, s) {
          var r = t.isArray(e) ? e.length : this.getLength(e, i);
          return this.optional(i) || r >= s;
        },
        maxlength: function (e, i, s) {
          var r = t.isArray(e) ? e.length : this.getLength(e, i);
          return this.optional(i) || s >= r;
        },
        rangelength: function (e, i, s) {
          var r = t.isArray(e) ? e.length : this.getLength(e, i);
          return this.optional(i) || (r >= s[0] && r <= s[1]);
        },
        min: function (t, e, i) {
          return this.optional(e) || t >= i;
        },
        max: function (t, e, i) {
          return this.optional(e) || i >= t;
        },
        range: function (t, e, i) {
          return this.optional(e) || (t >= i[0] && t <= i[1]);
        },
        step: function (e, i, s) {
          var r = t(i).attr("type"),
            n = "Step attribute on input type " + r + " is not supported.",
            a = ["text", "number", "range"],
            o = new RegExp("\\b" + r + "\\b"),
            l = r && !o.test(a.join());
          if (l) throw new Error(n);
          return this.optional(i) || e % s === 0;
        },
        equalTo: function (e, i, s) {
          var r = t(s);
          return (
            this.settings.onfocusout &&
              r.not(".validate-equalTo-blur").length &&
              r
                .addClass("validate-equalTo-blur")
                .on("blur.validate-equalTo", function () {
                  t(i).valid();
                }),
            e === r.val()
          );
        },
        remote: function (e, i, s, r) {
          if (this.optional(i)) return "dependency-mismatch";
          r = ("string" == typeof r && r) || "remote";
          var n,
            a,
            o,
            l = this.previousValue(i, r);
          return (
            this.settings.messages[i.name] ||
              (this.settings.messages[i.name] = {}),
            (l.originalMessage =
              l.originalMessage || this.settings.messages[i.name][r]),
            (this.settings.messages[i.name][r] = l.message),
            (s = ("string" == typeof s && { url: s }) || s),
            (o = t.param(t.extend({ data: e }, s.data))),
            l.old === o
              ? l.valid
              : ((l.old = o),
                (n = this),
                this.startRequest(i),
                (a = {}),
                (a[i.name] = e),
                t.ajax(
                  t.extend(
                    !0,
                    {
                      mode: "abort",
                      port: "validate" + i.name,
                      dataType: "json",
                      data: a,
                      context: n.currentForm,
                      success: function (t) {
                        var s,
                          a,
                          o,
                          h = t === !0 || "true" === t;
                        (n.settings.messages[i.name][r] = l.originalMessage),
                          h
                            ? ((o = n.formSubmitted),
                              n.resetInternals(),
                              (n.toHide = n.errorsFor(i)),
                              (n.formSubmitted = o),
                              n.successList.push(i),
                              (n.invalid[i.name] = !1),
                              n.showErrors())
                            : ((s = {}),
                              (a =
                                t ||
                                n.defaultMessage(i, {
                                  method: r,
                                  parameters: e,
                                })),
                              (s[i.name] = l.message = a),
                              (n.invalid[i.name] = !0),
                              n.showErrors(s)),
                          (l.valid = h),
                          n.stopRequest(i, h);
                      },
                    },
                    s
                  )
                ),
                "pending")
          );
        },
      },
    });
  var e,
    i = {};
  t.ajaxPrefilter
    ? t.ajaxPrefilter(function (t, e, s) {
        var r = t.port;
        "abort" === t.mode && (i[r] && i[r].abort(), (i[r] = s));
      })
    : ((e = t.ajax),
      (t.ajax = function (s) {
        var r = ("mode" in s ? s : t.ajaxSettings).mode,
          n = ("port" in s ? s : t.ajaxSettings).port;
        return "abort" === r
          ? (i[n] && i[n].abort(), (i[n] = e.apply(this, arguments)), i[n])
          : e.apply(this, arguments);
      }));
});
